/*
 * @Author: Hong.Zhang
 * @Date: 2022-06-13 14:31:13
 * @Description: 
 */
import type { Rule } from "async-validator";
import invariant from "invariant";
import React, { Component } from 'react';
import FiledContext from "./FieldContext";
import { View, Text } from 'react-native';
import { get } from 'lodash';
import styles from './Field.style';

interface FieldProps {
  name: string;
  label?: string;
  validateStatus?: 'success' | 'error' | 'warning';
  help?: string;
  extra?: string;
  children: React.ReactElement;
  rule?: Rule;
  valuePropsName?: string;
  onChangePropsName?: string;
  eventPropsName?: string;
}

export default class Field extends Component<FieldProps> {

  static contextType = FiledContext;

  name: string;
  label?: string;
  validateStatus?: string;
  help?: string;
  extra?: string;
  rule?: Rule;
  children: React.ReactElement;
  valuePropsName: string;;
  onChangePropsName: string;
  eventPropsName: string;

  constructor(props: FieldProps) {
    super(props);
    invariant(!!props.name, "name in filed is required");
    invariant(!!props.children && React.isValidElement(props?.children), "children in filed is not valid");
    this.name = props.name;
    this.label = props.label;
    this.validateStatus = props.validateStatus;
    this.help = props.help;
    this.extra = props.extra;
    this.rule = props.rule;
    this.children = props.children;
    this.valuePropsName = props.valuePropsName || "value";
    this.onChangePropsName = props.onChangePropsName || "onChange";
    this.eventPropsName = props.eventPropsName || "";
  }

  componentDidMount() {
    const { registerField } = this.context || {};
    if (registerField) {
      registerField(this);
    }
  }

  getControlled = (childProps: any) => {
    const { getFieldValue, setFieldValue } = this.context || {};
    if (getFieldValue) {
      Object.assign(childProps, {
        [`${this.valuePropsName}`]: getFieldValue(this.name),
      });
    }
    if (setFieldValue) {
      Object.assign(childProps, {
        [`${this.onChangePropsName}`]: (event: any) => {
          setFieldValue(this.name, get(event, this.eventPropsName, event));
        },
      });
    }
    return childProps;
  }

  onStoreChange = () => {
    this.forceUpdate();
  }

  render() {
    // can use field individualy without form
    const { getFieldError } = this.context || {};
    const isStringExtra = typeof this.extra === 'string';
    const fieldError = getFieldError?.(this.name);
    const firstError = fieldError?.[0];
    const validateStatus = firstError ? 'error': this.validateStatus;
    const help = firstError?.message || this.help;

    return (
      <View>
        {this.label && <Text style={styles.label}>{this.label}</Text>}
        <>
          {React.cloneElement(this.children, this.getControlled(this.children.props))}
        </>

        {!!validateStatus && validateStatus !== 'success' && !!help && (
          // @ts-ignore
          <Text style={styles[validateStatus]}>
            {help}
          </Text>
        )}
        {!!this.extra && isStringExtra && (
          <Text style={styles.extra}>{this.extra}</Text>
        )}
        <>
          {!!this.extra && !isStringExtra && (this.extra)}
        </>
      </View>
    )
  }
}