export interface settings {
    isDeep: boolean,
    isAsync: boolean,
    deepNumber: number
}

export interface data {
    url: string,
    settings: settings,
}