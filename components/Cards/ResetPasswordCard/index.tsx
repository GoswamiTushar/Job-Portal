import { FC, useState } from 'react'
import GenericInput from '../../GenericInput'
import * as Yup from 'yup'
import { Formik, Form } from 'formik'
import GenericButton from '../../GenericButton'
import { changePassword } from '../../../utils/apis'
import styles from './styles.module.scss'
import { useRouter } from 'next/router'
import Loader from '../../Loader'

const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string().required().min(6, "Password is too short - should be 6 chars minimum"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match').required("Please enter your password once again").min(6, "Password is too short - should be 6 chars minimum"),
});

const initialValues = {
    password: "",
    confirmPassword: ""
};


const index: FC = () => {
    const [authError, setAuthError] = useState("")
    const [isLoading, setLoading] = useState(false)
    const [submitClicked, setSubmitClicked] = useState(false)

    const router = useRouter()
    return (
        <div className={styles['reset-password']}>
            <header>
                <h1 className={styles["title"]}>
                    Reset Your Password
                </h1>
                <p className={styles["instructions"]}>
                    Enter your new password below.
                </p>
            </header>
            <div className={styles["form"]}>
                <Formik
                    initialValues={initialValues}
                    validationSchema={ResetPasswordSchema}
                    onSubmit={async (values) => {
                        setLoading(true)
                        setSubmitClicked(true)
                        try {
                            var message
                            const result = await changePassword({
                                password: values.password,
                                confirmPassword: values.confirmPassword,
                            })
                            message = result.message
                            // console.log(message)

                            if (result.success === true) {
                                localStorage.removeItem("squareboatChangePasswordToken")
                                router.push("/login")
                            }
                            else {
                                setSubmitClicked(false)
                                // alert(message)
                                setAuthError(message)
                            }
                        } finally {
                            setLoading(false)
                        }
                    }}
                >
                    {(formik) => {
                        const { errors, touched, values, handleBlur, handleChange, isValid, dirty } = formik;

                        return (
                            <Form>
                                <GenericInput
                                    name="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    touched={touched}
                                    label="Confirm password"
                                    type="password"
                                    placeHolder='Enter your password'
                                    error={(errors.password && touched.password) || authError}
                                />
                                <GenericInput
                                    name="confirmPassword"
                                    value={values.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    touched={touched}
                                    label="Confirm new password"
                                    type="password"
                                    placeHolder='Enter your password'
                                    error={(errors.confirmPassword && touched.confirmPassword) || authError}
                                />
                                {
                                    authError !== "" ?
                                        <div className={styles["auth-error"]}>
                                            <p className={styles['message']}>
                                                {authError}
                                            </p>
                                        </div>
                                        :
                                        <></>
                                }
                                <div className={styles["btn-container"]}>
                                    <GenericButton text="Reset" type="submit" disabled={submitClicked} />
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </div>
            <Loader isLoading={isLoading} />
        </div>
    )
}

export default index