import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from 'mui-datatables';
import {useEffect, useState} from 'react';
import {httpVideo} from "../../util/http";
import { Chip,IconButton,MuiThemeProvider } from '@material-ui/core';

import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import castMemberHttp from '../../util/http/cast-member-http';
import { CastMember, ListResponse } from '../../util/models';
import {Link} from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import DefaultTable, { TableColumn,makeActionStyles } from '../../components/Table';
import { useSnackbar } from 'notistack';

const CastMemberTypeMap = {
    1: 'Director',
    2: 'Ator'
};

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
        label: "Nome"
    },
    {
        name: "type",
        label: "Tipo",
        options: {
            customBodyRender: (value, tableMeta, updateValue) => {
                return CastMemberTypeMap[value];
            }
        }
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
        width: '13%',
        options: {
            sort: false,
            customBodyRender: (value, tableMeta) => {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/cast-members/${tableMeta.rowData[0]}/edit`}
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
    const [data, setData] = useState<CastMember[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const {data} = await castMemberHttp.list<ListResponse<CastMember>>();
                if (isSubscribed) {
                    setData(data.data);
                }
            } catch (error) {
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
        <MuiThemeProvider theme={makeActionStyles(columnDefinitions.length-1)}>
            <DefaultTable
                title="Listagem de Membros de elencos"
                columns={columnDefinitions}
                data={data}
                loading={loading}
            />

        </MuiThemeProvider>
    );
};

export default Table;