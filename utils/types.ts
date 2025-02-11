export interface ConsumerState {
    currentStepIndex: number;
    maxStepProgress: number;
}

export interface DomainAttr {
    id: number;
    domain_id: number;
    name: string;
}
export interface Domain {
    id: number;
    name: string;
    description: string;
    attributes: DomainAttr[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    tokens: { id_token: string; access_token: string; expires_in?: number; expires_at?: number };
}

export interface SSISearchCriterion {
    domain: Domain;
    attribute: DomainAttr;
    operator: "equal";
    value: string;
}
export type SSISearchStatus = "ACCEPTED" | "FINISHED" | "ERROR";
export interface SSISearchResponse {
    status: SSISearchStatus;
    process_id?: string;
}
export interface SSISearchPollResponse {
    status: SSISearchStatus;
    datasets_ids?: string[];
}

export type ProcessStatus = "NOT STARTED" | "IN PROGRESS" | "FINISHED" | "BLOCKED" | "FAILED";

export interface ProsumerWorkflowSSIData {
    process_id: string;
    status: SSISearchStatus;
    criteria: SSISearchCriterion[];
    results?: string[]; // Results, "datasets ids"
}

export interface ProsumerWorkflowData {
    id: string; // "prosumer id"
    ssi: ProsumerWorkflowSSIData; // this is for "step 1"
}
