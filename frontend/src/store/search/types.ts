import {AnyAction} from 'redux';

export interface Pagination {
    page: number;
    total: number;
    per_page: number;
}

export interface Order {
    sort: string | null;
    dir: string | null;
}

export interface State {
    search: string | { value, [key: string]: any};
    pagination: Pagination;
    order: Order;
}

export interface SetSearchAction extends AnyAction {
    payload: {
        search: string | {value, [key: string]: any}
    }
}

export interface SetPageAction extends AnyAction {
    payload: {
        page: number
    }
}

export interface SetPerPageAction extends AnyAction {
    payload: {
        per_page: number
    }
}

export interface SetOrderAction extends AnyAction {
    payload: {
        sort: string | null,
        dir: string | null
    }
}

export type Actions = SetSearchAction | SetPageAction | SetPerPageAction | SetOrderAction;