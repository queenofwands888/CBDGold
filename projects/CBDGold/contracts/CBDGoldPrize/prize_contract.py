import pyteal as pt

def approval_program():
    """Enhanced CBDGold Prize Contract

    Improvements:
    - Staking-based eligibility (requires minimum staked HEMP in external staking app)
    - Daily claim throttle (cooldown already present) and configurable minimum stake
    - Admin set staking app id & min stake
    - Asset funding & logging stays similar
    """

    # Global state keys
    total_prizes_claimed = pt.Bytes("total_prizes_claimed")
    prize_pool_balance = pt.Bytes("prize_pool_balance")
    admin_address = pt.Bytes("admin_address")
    claims_enabled = pt.Bytes("claims_enabled")
    staking_app_id = pt.Bytes("staking_app_id")
    min_stake_required = pt.Bytes("min_stake_req")
    daily_max_claims = pt.Bytes("daily_max")

    # Local state keys
    user_total_claims = pt.Bytes("total_claims")
    user_last_claim = pt.Bytes("last_claim")

    staked_key = pt.Bytes("staked_amount")

    @pt.Subroutine(pt.TealType.uint64)
    def verify_prize_eligibility(user_addr):
        staking_app = pt.App.globalGet(staking_app_id)
        min_req = pt.App.globalGet(min_stake_required)
        staked = pt.App.localGetEx(staking_app, user_addr, staked_key)
        return pt.Seq([
            staked,
            pt.If(staked.hasValue()).Then(
                pt.If(staked.value() >= min_req).Then(pt.Return(pt.Int(1))).Else(pt.Return(pt.Int(0)))
            ).Else(pt.Return(pt.Int(0)))
        ])

    # Initialize contract
    on_creation = pt.Seq([
        pt.App.globalPut(total_prizes_claimed, pt.Int(0)),
        pt.App.globalPut(prize_pool_balance, pt.Int(0)),
        pt.App.globalPut(admin_address, pt.Txn.sender()),
        pt.App.globalPut(claims_enabled, pt.Int(1)),
        pt.App.globalPut(staking_app_id, pt.Int(0)),
        pt.App.globalPut(min_stake_required, pt.Int(10_000_000)),
        pt.App.globalPut(daily_max_claims, pt.Int(0)),
        pt.Approve()
    ])

    # Opt-in to local storage
    on_opt_in = pt.Seq([
        pt.App.localPut(pt.Txn.sender(), user_total_claims, pt.Int(0)),
        pt.App.localPut(pt.Txn.sender(), user_last_claim, pt.Int(0)),
        pt.Approve()
    ])

    # Claim prize (Args: ["claim_prize", amount])
    on_claim_prize = pt.Seq([
        pt.Assert(pt.App.globalGet(claims_enabled) == pt.Int(1)),
        pt.Assert(pt.App.globalGet(staking_app_id) != pt.Int(0)),
        pt.Assert(pt.Global.latest_timestamp() > pt.App.localGet(pt.Txn.sender(), user_last_claim) + pt.Int(86400)),
        pt.Assert(verify_prize_eligibility(pt.Txn.sender()) == pt.Int(1)),
        pt.App.localPut(pt.Txn.sender(), user_total_claims, pt.App.localGet(pt.Txn.sender(), user_total_claims) + pt.Int(1)),
        pt.App.localPut(pt.Txn.sender(), user_last_claim, pt.Global.latest_timestamp()),
        pt.App.globalPut(total_prizes_claimed, pt.App.globalGet(total_prizes_claimed) + pt.Int(1)),
        pt.Log(pt.Concat(pt.Bytes("prize_claimed:"), pt.Txn.sender(), pt.Bytes(",amount:"), pt.Txn.application_args[1])),
        pt.Approve()
    ])

    # Fund prize pool (admin only) group[1] asset transfer
    on_fund_pool = pt.Seq([
        pt.Assert(pt.Txn.sender() == pt.App.globalGet(admin_address)),
        pt.Assert(pt.Gtxn[1].type_enum() == pt.TxnType.AssetTransfer),
        pt.Assert(pt.Gtxn[1].asset_receiver() == pt.Global.current_application_address()),
        pt.App.globalPut(prize_pool_balance, pt.App.globalGet(prize_pool_balance) + pt.Gtxn[1].asset_amount()),
        pt.Approve()
    ])

    # Get prize info
    on_get_prize_info = pt.Seq([
        pt.Log(pt.Concat(
            pt.Bytes("user_claims:"),
            pt.Itob(pt.App.localGet(pt.Txn.sender(), user_total_claims)),
            pt.Bytes(",last_claim:"),
            pt.Itob(pt.App.localGet(pt.Txn.sender(), user_last_claim)),
            pt.Bytes(",total_claimed:"),
            pt.Itob(pt.App.globalGet(total_prizes_claimed))
        )),
        pt.Approve()
    ])

    # Admin toggle claims / set staking app / min stake
    on_admin_toggle = pt.Seq([
        pt.Assert(pt.Txn.sender() == pt.App.globalGet(admin_address)),
        pt.App.globalPut(claims_enabled, pt.Int(1) - pt.App.globalGet(claims_enabled)),
        pt.Approve()
    ])
    on_set_staking = pt.Seq([
        pt.Assert(pt.Txn.sender() == pt.App.globalGet(admin_address)),
        pt.App.globalPut(staking_app_id, pt.Btoi(pt.Txn.application_args[1])),
        pt.Approve()
    ])
    on_set_min_stake = pt.Seq([
        pt.Assert(pt.Txn.sender() == pt.App.globalGet(admin_address)),
        pt.App.globalPut(min_stake_required, pt.Btoi(pt.Txn.application_args[1])),
        pt.Approve()
    ])

    program = pt.Cond(
        [pt.Txn.application_id() == pt.Int(0), on_creation],
        [pt.Txn.on_completion() == pt.OnCall.OptIn, on_opt_in],
        [pt.Txn.application_args[0] == pt.Bytes("claim_prize"), on_claim_prize],
        [pt.Txn.application_args[0] == pt.Bytes("fund_pool"), on_fund_pool],
        [pt.Txn.application_args[0] == pt.Bytes("get_prize_info"), on_get_prize_info],
        [pt.Txn.application_args[0] == pt.Bytes("admin_toggle"), on_admin_toggle],
        [pt.Txn.application_args[0] == pt.Bytes("set_staking_app"), on_set_staking],
        [pt.Txn.application_args[0] == pt.Bytes("set_min_stake"), on_set_min_stake]
    )

    return program

def clear_state_program():
    return pt.Approve()

if __name__ == "__main__":
    with open("prize_approval.teal", "w") as f:
        f.write(pt.compileTeal(approval_program(), pt.Mode.Application, version=8))
    with open("prize_clear.teal", "w") as f:
        f.write(pt.compileTeal(clear_state_program(), pt.Mode.Application, version=8))
