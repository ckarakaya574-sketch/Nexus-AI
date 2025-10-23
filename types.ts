
export type Mode = 'CHAT' | 'COMPLEX_QUERY' | 'LOW_LATENCY' | 'SEARCH_GROUNDING' | 'IMAGE_EDIT';

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface GroundedResponse {
    text: string;
    sources: GroundingSource[];
}
