import { FC, useState, useContext, useRef } from 'react'
import GenericInput from '../../GenericInput'
import { Formik, Form } from "formik";
import GenericButton from '../../GenericButton'
import * as Yup from "yup";
import { login } from '../../../utils/apis'
import { Router, useRouter } from 'next/router';
import Link from 'next/link'
import Loader from '../../Loader'
import { authContext } from '../../../pages/_app'
import styles from './styles.module.scss'

const SignInSchema = Yup.object().shape({
    email: Yup.string().email().required("Email is required"),

    password: Yup.string()
        .required("Password is required")
        .min(6, "Password is too short - should be 6 chars minimum"),
});

const initialValues = {
    email: "",
    password: ""
};

interface User {
    success: Boolean,
    data: any,
}

const index: FC = () => {
    const [isLoading, setLoading] = useState<boolean>(false)
    const userContext = useContext(authContext)
    const inputTouched = useRef(false)

    const router = useRouter()
    const [authError, setAuthError] = useState("")

    const handleLogin = (result: User) => {
        localStorage.clear()
        if (result.success === true) {
            const token = result.data.token;
            localStorage.setItem("squareboatJobPortalToken", token);
            localStorage.setItem("sb-userRole", result.data.userRole)
            // userContext.isAuthenticated = true
            userContext.setLogin()
            // console.log(result?.data.userRole)

            if (result.data.userRole === 0) {
                router.push('/postedjobs')
            }
            else if (result.data.userRole === 1) {
                router.push('/dashboard')
            }

        }
    }
    return (
        <div className={styles['login-card']}>
            <header>
                <h1 className={styles["title"]}>
                    Login
                </h1>
            </header>
            <Formik
                initialValues={initialValues}
                validationSchema={SignInSchema}
                innerRef={(actions) => {
                    if (actions?.touched.email || actions?.touched.password) {
                        inputTouched.current = true
                    }
                }}
                onSubmit={async (values, actions) => {
                    setLoading(true)
                    try {
                        var result = await login({ email: values.email, password: values.password })
                        if (result.success !== true) {
                            setAuthError(result?.message)
                            actions.setFieldError("password", result?.message)
                            actions.setErrors({ password: result?.message })
                            actions.setTouched({
                                email: false,
                                password: false
                            })
                        }
                        else {
                            actions.setTouched({
                                email: true,
                                password: true
                            })
                            handleLogin(result)
                        }
                    } finally {
                        setLoading(false)
                    }
                }
                }
            >
                {(formik) => {
                    const { errors, touched, isValid, dirty, values, handleChange, handleBlur } = formik;
                    return (
                        <Form>
                            <GenericInput
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                touched={touched.email}
                                label="Email Address*"
                                type="email"
                                error={(errors.email && touched.email) || authError}
                                placeHolder="Enter your email"
                            />
                            <div className={styles["wrapper"]}>
                                <div className={styles["forgot-password"]}>
                                    <Link href="/forgot-password">
                                        <a className={styles["link"]}>
                                            Forgot your Password?
                                        </a>
                                    </Link>
                                </div>
                                <GenericInput
                                    name="password"
                                    value={values.password}
                                    onChange={(e: any) => {
                                        setAuthError("")
                                        handleChange(e)
                                    }}
                                    onBlur={handleBlur}
                                    touched={touched.password}
                                    label="Password*"
                                    type="password"
                                    error={(errors.password && touched.email) || authError}
                                    placeHolder="Enter your password"
                                />
                            </div>
                            {
                                authError ?
                                    <div className={styles['auth-error']}>
                                        {/* <span className={styles['message']}>Incorrect email address or password.</span> */}
                                        <span className={styles['message']}>{authError}</span>
                                    </div>
                                    :
                                    null
                            }
                            <div className={styles["btn-container"]}>
                                <GenericButton
                                    text="Login"
                                    type='sumbit'
                                />
                            </div>
                        </Form>
                    );
                }}
            </Formik>
            <div className={styles["create-account"]}>
                New to MyJobs?
                <Link className={styles["signup-link"]} href="/signup">
                    Create an account
                </Link>
            </div>
            <Loader isLoading={isLoading} />
        </div>
    )
}

export default index