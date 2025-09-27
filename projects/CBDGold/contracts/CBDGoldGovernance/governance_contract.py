import pyteal as pt

def approval_program():
    """CBDGold Governance Contract - Manages community voting and proposals"""

    # Global state keys (expanded)
    total_proposals = pt.Bytes("total_proposals")
    active_proposals = pt.Bytes("active_proposals")
    admin_address = pt.Bytes("admin_address")
    voting_enabled = pt.Bytes("voting_enabled")
    min_weed_required = pt.Bytes("min_weed_required")
    quorum_min_votes = pt.Bytes("quorum_min")

    # Proposal state keys (using proposal ID as suffix)
    proposal_title = pt.Bytes("proposal_title_")
    proposal_description = pt.Bytes("proposal_description_")
    proposal_votes_for = pt.Bytes("proposal_votes_for_")
    proposal_votes_against = pt.Bytes("proposal_votes_against_")
    proposal_end_time = pt.Bytes("proposal_end_time_")
    proposal_status = pt.Bytes("proposal_status_")

    # Local state keys for users
    user_voting_power = pt.Bytes("voting_power")
    user_total_votes = pt.Bytes("total_votes")

    @pt.Subroutine(pt.TealType.uint64)
    def get_voting_power(user_addr):
        return pt.App.localGet(user_addr, user_voting_power)

    # Box key helpers
    @pt.Subroutine(pt.TealType.bytes)
    def vote_receipt_key(pid, addr):
        return pt.Concat(pt.Bytes("v_"), pid, addr)

    # Initialize contract
    on_creation = pt.Seq([
        pt.App.globalPut(total_proposals, pt.Int(0)),
        pt.App.globalPut(active_proposals, pt.Int(0)),
        pt.App.globalPut(admin_address, pt.Txn.sender()),
        pt.App.globalPut(voting_enabled, pt.Int(1)),
        pt.App.globalPut(min_weed_required, pt.Int(1_000_000)),
        pt.App.globalPut(quorum_min_votes, pt.Int(10_000_000)),
        pt.Approve()
    ])

    # Opt-in to local storage
    on_opt_in = pt.Seq([
        pt.App.localPut(pt.Txn.sender(), user_voting_power, pt.Int(0)),
        pt.App.localPut(pt.Txn.sender(), user_total_votes, pt.Int(0)),
        pt.Approve()
    ])

    # Create new proposal (admin only)
    on_create_proposal = pt.Seq([
        pt.Assert(pt.Txn.sender() == pt.App.globalGet(admin_address)),
        pt.App.globalPut(total_proposals, pt.App.globalGet(total_proposals) + pt.Int(1)),
        pt.App.globalPut(active_proposals, pt.App.globalGet(active_proposals) + pt.Int(1)),
        pt.App.globalPut(pt.Concat(proposal_title, pt.Itob(pt.App.globalGet(total_proposals))), pt.Txn.application_args[1]),
        pt.App.globalPut(pt.Concat(proposal_votes_for, pt.Itob(pt.App.globalGet(total_proposals))), pt.Int(0)),
        pt.App.globalPut(pt.Concat(proposal_votes_against, pt.Itob(pt.App.globalGet(total_proposals))), pt.Int(0)),
        pt.App.globalPut(pt.Concat(proposal_end_time, pt.Itob(pt.App.globalGet(total_proposals))), pt.Global.latest_timestamp() + pt.Int(604800)),
        pt.App.globalPut(pt.Concat(proposal_status, pt.Itob(pt.App.globalGet(total_proposals))), pt.Int(0)),
        pt.Log(pt.Concat(pt.Bytes("proposal_created:"), pt.Itob(pt.App.globalGet(total_proposals)), pt.Bytes(",title:"), pt.Txn.application_args[1])),
        pt.Approve()
    ])

    # Vote on proposal
    # Args: ["vote", proposal_id, vote(1/0)]
    on_vote_key = pt.ScratchVar()
    on_vote = pt.Seq([
        pt.Assert(pt.App.globalGet(voting_enabled) == pt.Int(1)),
        pt.Assert(get_voting_power(pt.Txn.sender()) >= pt.App.globalGet(min_weed_required)),
        pt.Assert(pt.App.globalGet(pt.Concat(proposal_status, pt.Txn.application_args[1])) == pt.Int(0)),
        pt.Assert(pt.Global.latest_timestamp() < pt.App.globalGet(pt.Concat(proposal_end_time, pt.Txn.application_args[1]))),
        on_vote_key.store(vote_receipt_key(pt.Txn.application_args[1], pt.Txn.sender())),
        pt.Assert(pt.Not(pt.BoxExists(on_vote_key.load()))),
        pt.If(pt.Btoi(pt.Txn.application_args[2]) == pt.Int(1)).Then(
            pt.App.globalPut(pt.Concat(proposal_votes_for, pt.Txn.application_args[1]), pt.App.globalGet(pt.Concat(proposal_votes_for, pt.Txn.application_args[1])) + get_voting_power(pt.Txn.sender()))
        ).Else(
            pt.App.globalPut(pt.Concat(proposal_votes_against, pt.Txn.application_args[1]), pt.App.globalGet(pt.Concat(proposal_votes_against, pt.Txn.application_args[1])) + get_voting_power(pt.Txn.sender()))
        ),
        pt.App.localPut(pt.Txn.sender(), user_total_votes, pt.App.localGet(pt.Txn.sender(), user_total_votes) + pt.Int(1)),
        pt.BoxCreate(on_vote_key.load(), pt.Int(1)),
        pt.BoxPut(on_vote_key.load(), pt.Bytes("1")),
        pt.Log(pt.Concat(pt.Bytes("vote_cast:"), pt.Txn.application_args[1], pt.Bytes(",vote:"), pt.Txn.application_args[2])),
        pt.Approve()
    ])

    # Finalize proposal (check results and update status)
    # Args: ["finalize_proposal", proposal_id]
    fv = pt.ScratchVar()
    av = pt.ScratchVar()
    tot = pt.ScratchVar()
    on_finalize_proposal = pt.Seq([
        pt.Assert(pt.Global.latest_timestamp() >= pt.App.globalGet(pt.Concat(proposal_end_time, pt.Txn.application_args[1]))),
        pt.Assert(pt.App.globalGet(pt.Concat(proposal_status, pt.Txn.application_args[1])) == pt.Int(0)),
        fv.store(pt.App.globalGet(pt.Concat(proposal_votes_for, pt.Txn.application_args[1]))),
        av.store(pt.App.globalGet(pt.Concat(proposal_votes_against, pt.Txn.application_args[1]))),
        tot.store(fv.load() + av.load()),
        pt.If(tot.load() < pt.App.globalGet(quorum_min_votes)).Then(
            pt.App.globalPut(pt.Concat(proposal_status, pt.Txn.application_args[1]), pt.Int(2))
        ).Else(
            pt.If(fv.load() > av.load()).Then(
                pt.App.globalPut(pt.Concat(proposal_status, pt.Txn.application_args[1]), pt.Int(1))
            ).Else(
                pt.App.globalPut(pt.Concat(proposal_status, pt.Txn.application_args[1]), pt.Int(2))
            )
        ),
        pt.App.globalPut(active_proposals, pt.App.globalGet(active_proposals) - pt.Int(1)),
        pt.Approve()
    ])

    # Get proposal info
    on_get_proposal = pt.Seq([
        pt.Log(pt.Concat(
            pt.Bytes("proposal:"),
            pt.Txn.application_args[1],
            pt.Bytes(",votes_for:"),
            pt.Itob(pt.App.globalGet(pt.Concat(proposal_votes_for, pt.Txn.application_args[1]))),
            pt.Bytes(",votes_against:"),
            pt.Itob(pt.App.globalGet(pt.Concat(proposal_votes_against, pt.Txn.application_args[1]))),
            pt.Bytes(",status:"),
            pt.Itob(pt.App.globalGet(pt.Concat(proposal_status, pt.Txn.application_args[1])))
        )),
        pt.Approve()
    ])

    # Update user voting power (when WEED balance changes)
    on_update_voting_power = pt.Seq([
        pt.App.localPut(pt.Txn.sender(), user_voting_power, pt.Btoi(pt.Txn.application_args[1])),
        pt.Approve()
    ])

    on_set_quorum = pt.Seq([
        pt.Assert(pt.Txn.sender() == pt.App.globalGet(admin_address)),
        pt.App.globalPut(quorum_min_votes, pt.Btoi(pt.Txn.application_args[1])),
        pt.Approve()
    ])

    program = pt.Cond(
        [pt.Txn.application_id() == pt.Int(0), on_creation],
        [pt.Txn.on_completion() == pt.OnCall.OptIn, on_opt_in],
        [pt.Txn.application_args[0] == pt.Bytes("create_proposal"), on_create_proposal],
        [pt.Txn.application_args[0] == pt.Bytes("vote"), on_vote],
        [pt.Txn.application_args[0] == pt.Bytes("finalize_proposal"), on_finalize_proposal],
        [pt.Txn.application_args[0] == pt.Bytes("get_proposal"), on_get_proposal],
        [pt.Txn.application_args[0] == pt.Bytes("update_voting_power"), on_update_voting_power],
        [pt.Txn.application_args[0] == pt.Bytes("set_quorum"), on_set_quorum]
    )

    return program

def clear_state_program():
    return pt.Approve()

if __name__ == "__main__":
    with open("governance_approval.teal", "w") as f:
        f.write(pt.compileTeal(approval_program(), pt.Mode.Application, version=8))
    with open("governance_clear.teal", "w") as f:
        f.write(pt.compileTeal(clear_state_program(), pt.Mode.Application, version=8))
