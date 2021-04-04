type Contract = {
    address: string
    created: number
    id: number
    name: string
    type: number
}

export type ContractVault = {
    id: number
    name: string
    underlyingUnit: number
    updatedBlock: number
    contract: Contract
    controller: Contract
    decimals: number
    governance: Contract
    strategy: Contract
    underlying: Contract
}