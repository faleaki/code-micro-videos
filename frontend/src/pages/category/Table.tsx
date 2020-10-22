import * as React from 'react';
import {MUIDataTableColumn, MUIDataTableMeta} from 'mui-datatables';
import {useEffect, useState, useRef, useReducer} from 'react';
import {httpVideo} from "../../util/http";
import { Chip, IconButton, MuiThemeProvider, Snackbar } from '@material-ui/core';

import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import categoryHttp from '../../util/http/category-http';
import { BadgeYes, BadgeNo } from '../../components/Badge';
import { ListResponse,Category } from '../../util/models';
import DefaultTable, { TableColumn,makeActionStyles } from '../../components/Table';
import { useSnackbar } from 'notistack';
import {Link} from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import { get,cloneDeep } from 'lodash';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import reducer, {INITIAL_STATE, Creators} from '../../store/search/index';

interface Pagination {
    page: number;
    total: number;
    per_page: number;
}

interface Order {
    sort: string | null;
    dir: string | null;
}

interface SearchState {
    search: string;
    pagination: Pagination;
    order: Order;
}

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '30%',
        options: {
            sort: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: '43%',
    },
    {
        name: "is_active",
        label: "Ativo?",
        width: '4%',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes/> : <BadgeNo/>;
            }
        },
    },
    {
        name: "created_at",
        label: "Criado em",
        width: '10%',
        options: {
            customBodyRender(value, tableMeta: MUIDataTableMeta, updateValue) {
            return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        }
    },
    {
        name: "Actions",
        label: "Ações",
        width: '13%',
        options: {
            sort: false,
            customBodyRender: (value, tableMeta) => {
                //console.log(tableMeta);
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/categories/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon/>
                    </IconButton>
                )
            }
        }
    },
]

const Table = () => {
    const snackbar = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Category[]>([]);
    const[loading, setLoading] = useState<boolean>(false);
    const [searchState, dispatch] = useReducer(reducer, INITIAL_STATE);
    //const [searchState, setSearchState] = useState<SearchState>(initialState);

    const columns = columnsDefinition.map( column => {
        return column.name === searchState.order.sort
            ? {
                ...column,
                options: {
                    ...column.options,
                    sortDirection: searchState.order.dir as any
                }
            }
            : column;
    });


    useEffect( () => {
        subscribed.current = true;
        getData();
        return () => {
            subscribed.current = false;
        }
    }, [searchState.search,
        searchState.pagination.page,
        searchState.pagination.per_page,
        searchState.order
    ]);

    async function getData(){
        setLoading(true);
            try {
                const {data} = await categoryHttp.list<ListResponse<Category>>({
                    queryParams: {
                        search: cleanSearchText(searchState.search),
                        page: searchState.pagination.page,
                        per_page: searchState.pagination.per_page,
                        sort: searchState.order.sort,
                        dir: searchState.order.dir,
                    }
                });
                if (subscribed.current) {
                    setData(data.data);
                    //setSearchState((prevState => ({
                    //    ...prevState,
                    //    pagination: {
                    //        ...prevState.pagination,
                    //        total: data.meta.total
                    //    }
                    //})))
                }
            } catch (error){
                console.error(error);
                if (categoryHttp.isCancelledRequest(error)){
                    return;
                }
                snackbar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    {variant: 'error',}
                )
            } finally {
                setLoading(false);
            }
    }

    function cleanSearchText(text){
        let newText = text;
        if (text && text.value !== undefined) {
            newText = text.value;
        }
        return newText;
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length-1)}>
            <DefaultTable
                title=""
                columns={columns}
                data={data}
                loading={loading}
                debouncedSearchTime={500}
                options={{
                    serverSide: true,
                    responsive: "standard",
                    searchText: searchState.search as any,
                    page: searchState.pagination.page - 1,
                    rowsPerPage: searchState.pagination.per_page,
                    count: searchState.pagination.total,
                    customToolbar: () => (
                        <FilterResetButton 
                            handleClick= { () => {
                                //dispatch( {type: 'reset'})}
                            }}
                        />
                    ),
                    onSearchChange: (value) => dispatch(Creators.setSearch({search: value as string})),
                    onChangePage: (page) => dispatch(Creators.setPage({page: page + 1})),
                    onChangeRowsPerPage: (perPage) => dispatch(Creators.setPerPage({per_page: perPage})),
                    onColumnSortChange: (changedColumn: string, direction: string) => 
                        dispatch(Creators.setOrder({
                            sort: changedColumn,
                            dir: direction.includes('desc') ? 'desc' : 'asc',
                        })
                    ),
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;
