import { FC, InputHTMLAttributes } from 'react'
import { Field, ErrorMessage } from "formik";
import styles from './styles.module.scss'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: string,
  name: string,
  label: string,
  error?: any,
  touched?: any
  placeHolder: string,
  id?: string
  value: string
  onChange: any
  onBlur: any,
  component?: string,
  rows?: string,
}

const index: FC<InputProps> = ({
  error,
  touched,
  label,
  name,
  type = 'text',
  placeHolder = "test",
  id,
  value,
  onChange,
  onBlur,
  component,
  rows,
}) => {
  // console.log("error for:", name, "=======>", error)
  return (
    <div className={styles["form-row"]}>
      <label className={styles['label']} htmlFor={label}>{label}</label>
      <Field
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`${styles['input-field']} ${error || (touched && error) ? styles['input-field-error'] : styles['input-field-normal']}`}
        placeholder={placeHolder}
        id={id}
        component={component}
        autoomplete={type === 'password' ? "off" : ""}
        rows={rows}
      />
      <ErrorMessage name={name} component="span" className={`${styles['error']} ${error ? styles['d-show'] : styles['d-hidden']}`} />
    </div>
  )
}

export default index