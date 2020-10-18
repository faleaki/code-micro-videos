import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from 'mui-datatables';
import {useEffect, useState} from 'react';
import {httpVideo} from "../../util/http";
import genreHttp from "../../util/http/genre-http";
import { Chip,IconButton } from '@material-ui/core';

import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import { useSnackbar } from 'notistack';
import DefaultTable, { TableColumn,makeActionStyles } from '../../components/Table';
import { BadgeYes, BadgeNo } from '../../components/Badge';
import {Link} from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import { ListResponse,Genre } from '../../util/models';

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
        width: "23%"
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
        name: "categories",
        label: "Categorias",
        width: '20%',
        options: {
            customBodyRender: (value, tableMeta, updateValue) => {
                let saida:string = '';
                for (let item of value){
                    saida = saida.concat(item['name'], ', ');
                    //console.log('VALOR', saida);
                }
                return saida;
                //return value[0]['name'];
                //return value.map(value => value.name).join(', ');
            }
        },
    },
    {
        name: "created_at",
        label: "Criado em",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
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
                console.log(tableMeta);
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/genres/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon/>
                    </IconButton>
                )
            }
        }
    },
]

type Props = {};   
const Table = (props: Props) => {

    const snackbar = useSnackbar();
    const [data, setData] = useState<Genre[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect( () => {
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const {data} = await genreHttp.list<ListResponse<Genre>>();
                if (isSubscribed) {
                    setData(data.data);
                }
            } catch(error) {
                console.error(error);
                snackbar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    {variant: 'error'}
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
            title="Listagem de gêneros"
            columns={columnDefinitions}
            data={data}
            loading={loading}
        />
    );
};

export default Table;