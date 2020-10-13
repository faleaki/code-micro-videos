import * as React from 'react';
import { Box, Button, Checkbox, makeStyles, TextField, Theme } from '@material-ui/core';
import {ButtonProps} from "@material-ui/core/Button";
import {useForm} from "react-hook-form";
import categoryHttp from "../../util/http/category-http";

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

const validationSchema = yup.object().shape({
    name: yup.string().required()
});

export const Form = () => {

    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: "contained",
    };

    const {register, handleSubmit, getValues, errors} = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            name: null,
            is_active: true
        },
    });

    function onSubmit(formData, event) {
        console.log(event);
        categoryHttp
            .create(formData)
            .then((response) => console.log(response));
    }
    console.log("ERROS:"+errors.name);
    return(
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
                inputRef={register({
                    required: 'O campo nome é requerido',
                    maxLength: {
                        value: 2,
                        message: 'O máximo de caracteres é 2'
                    }
                })}
                error={errors.name !== undefined}
            />
            {
                errors.name && errors.name.type === 'required' && 
                (<p>{errors.name.message}</p>)
            }
            <TextField
                name="description"
                label="Descrição"
                multiline
                rows="4"
                fullWidth
                variant={"outlined"}
                margin={"normal"}
                inputRef={register}
            />
            <Checkbox
                name="is_active"
                color={"primary"}
                inputRef={register}
                defaultChecked
            />
            Ativo?
            <Box dir={"rtl"}>
                <Button 
                    color={"primary"}
                    {...buttonProps}
                    onClick={() => onSubmit(getValues(), null)}
                >
                    Salvar
                </Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};