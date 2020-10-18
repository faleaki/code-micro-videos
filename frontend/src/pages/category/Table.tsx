    import * as React from 'react';
import {MUIDataTableColumn} from 'mui-datatables';
import {useEffect, useState} from 'react';
import {httpVideo} from "../../util/http";
import { Chip, Snackbar } from '@material-ui/core';

import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import categoryHttp from '../../util/http/category-http';
import { BadgeYes, BadgeNo } from '../../components/Badge';
import { ListResponse,Category } from '../../util/models';
import DefaultTable, { TableColumn } from '../../components/Table';
import { useSnackbar } from 'notistack';

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
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes/> : <BadgeNo/>;
            }
        },
        width: '4%'
    },
    {
        name: "created_at",
        label: "Criado em",
        width: '10%',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
            return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        }
    },
    {
        name: "Actions",
        label: "Ações",
        width: '10%'
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
    const [data, setData] = useState<Category[]>([]);
    const[loading, setLoading] = useState<boolean>(false);

    useEffect( () => {
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const {data} = await categoryHttp.list<ListResponse<Category>>();
                if (isSubscribed) {
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
        })();

        return () => {
            isSubscribed = false;
        }
    }, []);

    return (
        <DefaultTable
            title=""
            columns={columnDefinitions}
            data={data}
            loading={loading}
            options={{responsive: "standard"}}
        />
    );
};

export default Table;