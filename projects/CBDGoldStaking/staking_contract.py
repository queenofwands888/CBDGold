import pyteal as pt

"""Enhanced CBDGold Staking Contract

Adds:
- Reward emission (per-second) with precision accounting (acc_reward_per_token_scaled)
- Claim function and reward debt tracking
- Configurable staking asset ID (one-time set), emission rate, and admin controls
- Correct unstake validation (Btoi) and HEMP asset usage
- Tier recalculation post stake/unstake

DISCLAIMER: This is a reference implementation; audit before production.
"""

def approval_program():
    # ------------------ Global Keys ------------------
    total_staked = pt.Bytes("total_staked")            # uint (raw token units)
    staking_enabled = pt.Bytes("staking_enabled")      # 0/1
    admin_address = pt.Bytes("admin_address")          # bytes
    asset_id = pt.Bytes("asset_id")                    # uint (ASA id for HEMP)
    reward_rate = pt.Bytes("reward_rate")              # uint tokens per second (scaled raw units)
    last_reward_time = pt.Bytes("last_reward_time")    # uint timestamp
    acc_reward_per_token = pt.Bytes("acc_rpt")         # uint scaled by SCALE
    scale_const = pt.Int(1_000_000_000)                 # 1e9 scaling to preserve precision

    # ------------------ Local Keys -------------------
    user_staked_amount = pt.Bytes("staked_amount")
    user_reward_debt = pt.Bytes("reward_debt")          # tracks user share of global acc_rpt
    user_pending = pt.Bytes("pending")                  # accumulated but unclaimed
    user_stake_timestamp = pt.Bytes("stake_timestamp")
    user_tier = pt.Bytes("tier")                        # 0..3

    # Tier thresholds (micro units)
    bronze_threshold = pt.Int(10_000_000)
    silver_threshold = pt.Int(100_000_000)
    gold_threshold = pt.Int(1_000_000_000)

    @pt.Subroutine(pt.TealType.uint64)
    def calculate_tier(staked_amount):
        return pt.If(staked_amount >= gold_threshold).Then(pt.Int(3)).ElseIf(
            staked_amount >= silver_threshold
        ).Then(pt.Int(2)).ElseIf(
            staked_amount >= bronze_threshold
        ).Then(pt.Int(1)).Else(pt.Int(0))

    # Update global reward accumulator
    @pt.Subroutine(pt.TealType.none)
    def update_rewards():
        current = pt.Global.latest_timestamp()
        elapsed = pt.ScratchVar()
        increment = pt.ScratchVar()
        return pt.Seq(
            pt.If(pt.App.globalGet(total_staked) > pt.Int(0)).Then(
                pt.Seq(
                    elapsed.store(current - pt.App.globalGet(last_reward_time)),
                    pt.If(elapsed.load() > pt.Int(0)).Then(
                        pt.Seq(
                            increment.store(
                                (elapsed.load() * pt.App.globalGet(reward_rate) * scale_const) / pt.App.globalGet(total_staked)
                            ),
                            pt.App.globalPut(acc_reward_per_token, pt.App.globalGet(acc_reward_per_token) + increment.load())
                        )
                    )
                )
            ),
            pt.App.globalPut(last_reward_time, current)
        )

    @pt.Subroutine(pt.TealType.none)
    def harvest(user):
        staked = pt.ScratchVar()
        acc = pt.ScratchVar()
        debt = pt.ScratchVar()
        pending_calc = pt.ScratchVar()
        return pt.Seq(
            staked.store(pt.App.localGet(user, user_staked_amount)),
            acc.store(pt.App.globalGet(acc_reward_per_token)),
            debt.store(pt.App.localGet(user, user_reward_debt)),
            pending_calc.store((staked.load() * acc.load()) / scale_const - debt.load()),
            pt.If(pending_calc.load() > pt.Int(0)).Then(
                pt.App.localPut(user, user_pending, pt.App.localGet(user, user_pending) + pending_calc.load())
            ),
            pt.App.localPut(user, user_reward_debt, (staked.load() * acc.load()) / scale_const)
        )

    # ------------------ On Creation ------------------
    on_creation = pt.Seq(
        pt.App.globalPut(total_staked, pt.Int(0)),
        pt.App.globalPut(staking_enabled, pt.Int(1)),
        pt.App.globalPut(admin_address, pt.Txn.sender()),
        pt.App.globalPut(reward_rate, pt.Int(0)),               # default 0 until configured
        pt.App.globalPut(last_reward_time, pt.Global.latest_timestamp()),
        pt.App.globalPut(acc_reward_per_token, pt.Int(0)),
        pt.Approve()
    )

    # ------------------ Opt-In -----------------------
    on_opt_in = pt.Seq(
        pt.App.localPut(pt.Txn.sender(), user_staked_amount, pt.Int(0)),
        pt.App.localPut(pt.Txn.sender(), user_reward_debt, pt.Int(0)),
        pt.App.localPut(pt.Txn.sender(), user_pending, pt.Int(0)),
        pt.App.localPut(pt.Txn.sender(), user_stake_timestamp, pt.Int(0)),
        pt.App.localPut(pt.Txn.sender(), user_tier, pt.Int(0)),
        pt.Approve()
    )

    # ------------------ Set Parameters (Admin) -------
    # Args: ["set_params", asset_id, reward_rate]
    on_set_params = pt.Seq(
        pt.Assert(pt.Txn.sender() == pt.App.globalGet(admin_address)),
        pt.If(pt.App.globalGet(asset_id) == pt.Int(0)).Then(pt.App.globalPut(asset_id, pt.Btoi(pt.Txn.application_args[1]))),
        pt.App.globalPut(reward_rate, pt.Btoi(pt.Txn.application_args[2])),
        pt.Approve()
    )

    # ------------------ Stake ------------------------
    # Group: [0] app call, [1] asset transfer of staking asset to app
    on_stake = pt.Seq(
        pt.Assert(pt.App.globalGet(staking_enabled) == pt.Int(1)),
        pt.Assert(pt.Txn.group_index() == pt.Int(0)),
        pt.Assert(pt.Gtxn[1].type_enum() == pt.TxnType.AssetTransfer),
        pt.Assert(pt.Gtxn[1].xfer_asset() == pt.App.globalGet(asset_id)),
        pt.Assert(pt.Gtxn[1].asset_receiver() == pt.Global.current_application_address()),
        update_rewards(),
        harvest(pt.Txn.sender()),
        pt.App.localPut(pt.Txn.sender(), user_staked_amount, pt.App.localGet(pt.Txn.sender(), user_staked_amount) + pt.Gtxn[1].asset_amount()),
        pt.App.globalPut(total_staked, pt.App.globalGet(total_staked) + pt.Gtxn[1].asset_amount()),
        pt.App.localPut(pt.Txn.sender(), user_stake_timestamp, pt.Global.latest_timestamp()),
        pt.App.localPut(pt.Txn.sender(), user_tier, calculate_tier(pt.App.localGet(pt.Txn.sender(), user_staked_amount))),
        pt.App.localPut(pt.Txn.sender(), user_reward_debt, (pt.App.localGet(pt.Txn.sender(), user_staked_amount) * pt.App.globalGet(acc_reward_per_token)) / scale_const),
        pt.Approve()
    )

    # ------------------ Unstake ----------------------
    # Args: ["unstake", amount]
    on_unstake_amt = pt.ScratchVar()
    on_unstake = pt.Seq(
        pt.Assert(pt.App.globalGet(staking_enabled) == pt.Int(1)),
        on_unstake_amt.store(pt.Btoi(pt.Txn.application_args[1])),
        pt.Assert(pt.App.localGet(pt.Txn.sender(), user_staked_amount) >= on_unstake_amt.load()),
        update_rewards(),
        harvest(pt.Txn.sender()),
        pt.App.localPut(pt.Txn.sender(), user_staked_amount, pt.App.localGet(pt.Txn.sender(), user_staked_amount) - on_unstake_amt.load()),
        pt.App.globalPut(total_staked, pt.App.globalGet(total_staked) - on_unstake_amt.load()),
        pt.App.localPut(pt.Txn.sender(), user_tier, calculate_tier(pt.App.localGet(pt.Txn.sender(), user_staked_amount))),
        pt.InnerTxnBuilder.Begin(),
        pt.InnerTxnBuilder.SetFields({
            pt.TxnField.type_enum: pt.TxnType.AssetTransfer,
            pt.TxnField.asset_receiver: pt.Txn.sender(),
            pt.TxnField.asset_amount: on_unstake_amt.load(),
            pt.TxnField.xfer_asset: pt.App.globalGet(asset_id)
        }),
        pt.InnerTxnBuilder.Submit(),
        pt.App.localPut(pt.Txn.sender(), user_reward_debt, (pt.App.localGet(pt.Txn.sender(), user_staked_amount) * pt.App.globalGet(acc_reward_per_token)) / scale_const),
        pt.Approve()
    )

    # ------------------ Claim Rewards ----------------
    claim_pending = pt.ScratchVar()
    on_claim = pt.Seq(
        update_rewards(),
        harvest(pt.Txn.sender()),
        claim_pending.store(pt.App.localGet(pt.Txn.sender(), user_pending)),
        pt.If(claim_pending.load() > pt.Int(0)).Then(
            pt.Seq(
                pt.InnerTxnBuilder.Begin(),
                pt.InnerTxnBuilder.SetFields({
                    pt.TxnField.type_enum: pt.TxnType.AssetTransfer,
                    pt.TxnField.asset_receiver: pt.Txn.sender(),
                    pt.TxnField.asset_amount: claim_pending.load(),
                    pt.TxnField.xfer_asset: pt.App.globalGet(asset_id)
                }),
                pt.InnerTxnBuilder.Submit(),
                pt.App.localPut(pt.Txn.sender(), user_pending, pt.Int(0))
            )
        ),
        pt.Approve()
    )

    # ------------------ Info -------------------------
    on_get_info = pt.Seq(
        pt.Log(pt.Concat(
            pt.Bytes("staked:"), pt.Itob(pt.App.localGet(pt.Txn.sender(), user_staked_amount)),
            pt.Bytes(",tier:"), pt.Itob(pt.App.localGet(pt.Txn.sender(), user_tier)),
            pt.Bytes(",pending:"), pt.Itob(pt.App.localGet(pt.Txn.sender(), user_pending))
        )),
        pt.Approve()
    )

    # ------------------ Admin Toggle -----------------
    on_admin_toggle = pt.Seq(
        pt.Assert(pt.Txn.sender() == pt.App.globalGet(admin_address)),
        pt.App.globalPut(staking_enabled, pt.Int(1) - pt.App.globalGet(staking_enabled)),
        pt.Approve()
    )

    program = pt.Cond(
        [pt.Txn.application_id() == pt.Int(0), on_creation],
        [pt.Txn.on_completion() == pt.OnCall.OptIn, on_opt_in],
        [pt.Txn.application_args[0] == pt.Bytes("set_params"), on_set_params],
        [pt.Txn.application_args[0] == pt.Bytes("stake"), on_stake],
        [pt.Txn.application_args[0] == pt.Bytes("unstake"), on_unstake],
        [pt.Txn.application_args[0] == pt.Bytes("claim"), on_claim],
        [pt.Txn.application_args[0] == pt.Bytes("get_info"), on_get_info],
        [pt.Txn.application_args[0] == pt.Bytes("admin_toggle"), on_admin_toggle]
    )
    return program

def clear_state_program():
    return pt.Approve()

if __name__ == "__main__":
    with open("staking_approval.teal", "w") as f:
        f.write(pt.compileTeal(approval_program(), pt.Mode.Application, version=8))
    with open("staking_clear.teal", "w") as f:
        f.write(pt.compileTeal(clear_state_program(), pt.Mode.Application, version=8))
