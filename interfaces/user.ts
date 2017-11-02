/**
 * User and UserSession interface for login
 * DO NOT MODIFY THIS FILE, EXTEND THE INTERFACE INSTEAD
*/

export interface User {
    'employee.rec_name'?: string;
    employee: number;
    'employee.party.name'?: string;
    'employee.party': number;
    'language.code'?: string;
    company: number;
}

export interface UserSession {
    userId: string;
    sessionId: string;
    database?: string;
};
