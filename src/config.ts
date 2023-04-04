export const CHANNELS = {
    DISPLAY_EMAIL: "display_email",
    SAVE_EMAIL: "save_email",
    EXTRACT_EMAIL: "extract_email",
    CONSOLE: "console",
    STATUS: "status",
}

export const KEY_LOCAL_STORAGE = {
    EMAILS: "emails",
    SETTINGS: "settings",
}

export enum ACTION_EMAIL {
    ADD,
    REMOVE,
    CLEAR,
}

export enum STATUS {
    WAIT,
    ADDING
}