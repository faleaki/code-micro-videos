import * as React from 'react';
import {MUIDataTableColumn, MUIDataTableMeta} from 'mui-datatables';
import {useEffect, useState, useRef} from 'react';
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
import { cloneDeep } from 'lodash';

interface Pagination {
    page: number;
    total: number;
    per_page: number;
}

interface SearchState {
    search: string;
    pagination: Pagination;
}

const columnDefinitions: TableColumn[] = [
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
        width: '43%'
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
/*
interface Category{
    id: string;
    name: string;
}
*/
type Props = {};

const Table = (props: Props) => {

    const snackbar = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Category[]>([]);
    const[loading, setLoading] = useState<boolean>(false);
    const [searchState, setSearchState] = useState<SearchState>({
        search: 'asdfasdf',
        pagination: {
            page: 1,
            total: 0,
            per_page: 10
        }
    });

    useEffect( () => {
        subscribed.current = true;
        getData();
        return () => {
            subscribed.current = false;
        }
    }, [searchState]);

    async function getData(){
        setLoading(true);
            try {
                const {data} = await categoryHttp.list<ListResponse<Category>>({
                    queryParams: {
                        search: searchState.search
                    }
                });
                if (subscribed.current) {
                    setData(data.data);
                }
            } catch (error){
                console.error(error);
                snackbar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    {variant: 'error',}
                )
            } finally {
                setLoading(false);
            }
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnDefinitions.length-1)}>
            <DefaultTable
                title=""
                columns={columnDefinitions}
                data={data}
                loading={loading}
                options={{
                    responsive: "standard",
                    searchText: searchState.search,
                    page: searchState.pagination.page,
                    rowsPerPage: searchState.pagination.page,
                    onSearchChange: (value) => setSearchState((prevState => ({
                        ...prevState,
                        search: value
                        }
                    )))
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;