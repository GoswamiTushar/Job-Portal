import { FC, useState } from 'react'
import GenericInput from '../../GenericInput'
import * as Yup from 'yup'
import { Formik, Form, ErrorMessage } from 'formik'
import GenericButton from '../../GenericButton'
import { forgotPassword, verifyToken } from '../../../utils/apis'
import Loader from '../../Loader'
import styles from './styles.module.scss'
import { useRouter } from 'next/router'

const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email().required("Email is required"),
});

const initialValues = {
    email: "",
};

interface User {
    success: Boolean,
    data: any,
}

const index: FC = () => {
    const router = useRouter()
    const [isLoading, setLoading] = useState<boolean>(false)
    const [submitClicked, setSubmitClicked] = useState(false)


    const handleForgotPaassword = async (result: User) => {
        setLoading(true)
        if (result.success === true) {
            const token = result.data.token
            try {
                const isVerified = await verifyToken({ token: token })
                if (isVerified.success === true) {
                    localStorage.setItem("squareboatChangePasswordToken", token)
                    router.push("/reset-password")
                }
                else {
                    setSubmitClicked(false)
                    alert("Token not verified")
                }
            } finally {
                setLoading(false)
            }
        }
    }
    return (
        <div className={styles['forgot-password-card']}>
            <header>
                <h1 className={styles["title"]}>
                    Forgot your password?
                </h1>
                <p className={styles["instructions"]}>
                    Enter the email associated with your account and we’ll send you instructions to reset your password.
                </p>
            </header>

            <div className={styles["form"]}>
                <Formik
                    initialValues={initialValues}
                    validationSchema={ForgotPasswordSchema}
                    onSubmit={async (values) => {
                        setSubmitClicked(true)
                        setLoading(true)
                        try {
                            var result = await forgotPassword({ email: values.email })
                            result.success !== true ? alert("User does not exist") : null
                            handleForgotPaassword(result)
                        } finally {
                            setLoading(false)
                        }

                    }}
                >
                    {(formik) => {
                        const { errors, touched, isValid, dirty, handleBlur, handleChange, values } = formik;

                        return (
                            <Form>
                                <GenericInput
                                    name="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    touched={touched}
                                    label="Email Address"
                                    type="text"
                                    placeHolder='Enter your email'
                                    error={errors.email}
                                />
                                <div className={styles["btn-container"]}>
                                    <GenericButton text="Submit" type="submit" disabled={submitClicked} />
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