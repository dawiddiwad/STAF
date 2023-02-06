export interface RecordUiData {
    Compact?: LayoutMode,
    Full?: LayoutMode
}

interface LayoutMode {
    Create?: Layout | boolean,
    Edit?: Layout | boolean,
    View?: Layout | boolean
}

interface Layout {
    sections: any
}

export class UiLayout implements RecordUiData {
    Compact?: LayoutMode;
    Full?: LayoutMode;

    constructor(data: RecordUiData){
        this.Compact = data.Compact;
        this.Full = data.Full;
    }
}

