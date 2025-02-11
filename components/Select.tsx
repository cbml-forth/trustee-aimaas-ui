import { useState } from "preact/hooks";
// import { Box, InputLabel, MenuItem, FormControl, Select } from '$mui';
// import { Calendar } from '$prime';
// import InputLabel from '@mui';
// import MenuItem from '@mui';
// import FormControl from '@mui';
// import Select, { SelectChangeEvent } from '@mui';
// import Box from '@mui/material/Box';
// import InputLabel from '@mui/material/InputLabel';
// import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
// import Select, { SelectChangeEvent } from '@mui/material/Select';

import classNames from "@/utils/classnames.js";
export interface SelectOption {
    id: number;
    name: string;
    value?: string;
    selected?: boolean;
}
export interface SelectProps {
    name: string;
    label?: string;
    options: SelectOption[];
    help_text?: string;
    error_text?: string;
    onChange?: CallableFunction;
}
export function BasicSelect(props: SelectProps) {
    const opts = props.options.map((o) => {
        return (
            <option value={o.value || o.name} selected={o.selected || false}>
                {o.name}
            </option>
        );
    });

    const max = Math.ceil(1.5 * Math.max(...props.options.map((o) => o.name.length)));

    const handleChange = (event: any) => {
        if (props.onChange) {
            props.onChange(event.target.value as string);
        }
    };

    return (
        <div
            class={classNames({
                "field suffix border small": 1,
                "label": props.label,
                "invalid": props.error_text,
            })}
        >
            <select name={props.name} onChange={handleChange} style={{ "min-width": `${max}ch` }}>
                {opts}
            </select>
            {props.label && <label>{props.label}</label>}
            <i>arrow_drop_down</i>
            {props.help_text && <span class="helper">{props.help_text}</span>}
            {props.error_text && <span class="error">{props.error_text}</span>}
        </div>
    );
}
