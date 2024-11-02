import { create } from 'zustand';
import { Node } from '@xyflow/react';

export interface Option {
    value: string;
    label: string;
    disable?: boolean;
    /** fixed option that can't be removed. */
    fixed?: boolean;
    /** Group the options by providing key. */
    [key: string]: string | boolean | undefined;
}

interface GoogleFile {
    id: string;
    name: string;
    mimeType: string;
    // Add other properties as needed
    [key: string]: any;
}

interface FlowStore {
    googleFile: GoogleFile;
    setGoogleFile: (googleFile: GoogleFile) => void;
    slackChannels: Option[];
    setSlackChannels: (slackChannels: Option[]) => void;
    selectedSlackChannels: Option[];
    setSelectedSlackChannels: (selectedSlackChannels: Option[]) => void;
}

export const useFlowStore = create<FlowStore>((set) => ({
    googleFile: {} as GoogleFile,
    setGoogleFile: (googleFile: GoogleFile) => set({ googleFile }),
    slackChannels: [],
    setSlackChannels: (slackChannels: Option[]) => set({ slackChannels }),
    selectedSlackChannels: [],
    setSelectedSlackChannels: (selectedSlackChannels: Option[]) =>
        set({ selectedSlackChannels }),
}));