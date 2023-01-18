import { FC, useState } from 'react'
import OptionButton from '../../OptionButton'
import GenericInput from '../../GenericInput'
import { Formik, Form, ErrorMessage } from "formik";
import GenericButton from '../../GenericButton'
import * as Yup from "yup";
import { signup } from '../../../utils/apis'
import Link from 'next/link';
import { icons } from './_icons'
import styles from './styles.module.scss'
import { useRouter } from 'next/router';
import Loader from '../../Loader';

const initialValues = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    skills: "",
};


const SignUpSchemaRecruiter = Yup.object().shape(
    {
        fullName: Yup.string()
            .required("The field is mandatory.")
            .matches(/^[aA-zZ]*$/, "Only Alphabets w/o space allowed")
            .min(3, "Name is too small")
            .max(100, "Name too large, 100 chars allowed"),

        email: Yup.string()
            .email("Invalid email address.")
            .max(60, "Email address too long")
            .required("Email address is required"),

        password: Yup.string()
            .required(" ")
            .min(6, "Password is too short")
            .max(50, "Password is too long"),

        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required("The field is mandatory."),

        skills: Yup.string()
            .optional()
            .max(50, "Skill set should be 50 chars")
            .matches(/^[a-zA-Z\s?#+]+(,\s?[a-zA-Z#+]+)*$/, "Comma saperated values accepeted with 1 space"),
    }
);
const SignUpSchemaCandidate = Yup.object().shape(
    {
        fullName: Yup.string()
            .required("The field is mandatory.")
            .matches(/^[aA-zZ]*$/, "Only Alphabets w/o space allowed")
            .min(3, "Name is too small")
            .max(256, "Name too large, 256 chars allowed"),

        email: Yup.string()
            .email("Invalid email address.")
            .required("Email address is required"),

        password: Yup.string()
            .required(" ")
            .min(6, "Password is too short")
            .max(50, "Password is too long"),

        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required("The field is mandatory."),

        skills: Yup.string()
            .matches(/^[a-zA-Z\s?#+]+(,\s?[a-zA-Z#+]+)*$/, "Comma saperated values accepeted with 1 space")
            .required("Skills are required for candidate")
            .max(50, "Skill set should be 50 chars")
            .min(3, "Enter skills more than 3 chars."),
    }
);

const index: FC = () => {
    const router = useRouter()
    const [isRecruiter, setIsRecruiter] = useState(true)
    const [isCandidate, setIsCandidate] = useState(false)
    const [authError, setAuthError] = useState("")
    const [isLoading, setLoading] = useState(false)
    const [submitClicked, setSubmitClicked] = useState(false)
    return (
        <div className={styles['signup-card']}>
            <header>
                <h1 className={styles["title"]}>
                    Signup
                </h1>
            </header>
            <div className={styles["role-selection"]}>
                <p className={styles["label"]}>
                    I'm a*
                </p>
                <div className={styles["wrapper"]}>
                    <OptionButton
                        unselect={setIsCandidate}
                        setIsSelected={setIsRecruiter}
                        isSelected={isRecruiter}
                        text="Recruiter"
                        iconURL={isRecruiter ? icons.recruiterWhite : icons.recruiterBlue} />

                    <OptionButton
                        unselect={setIsRecruiter}
                        setIsSelected={setIsCandidate}
                        isSelected={isCandidate}
                        text="Candidate"
                        iconURL={isCandidate ? icons.candidateWhite : icons.candidateBlue} />
                </div>
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={
                    isCandidate ? SignUpSchemaCandidate : SignUpSchemaRecruiter
                }
                onSubmit={async (values) => {
                    setLoading(true)
                    setSubmitClicked(true)
                    try {
                        const result = await signup({
                            fullName: values.fullName,
                            email: values.email,
                            password: values.password,
                            confirmPassword: values.confirmPassword,
                            skills: values.skills,
                            isRecruiter: isRecruiter,
                        })
                        // console.log(result)
                        if (result.success === true) {
                            router.push("/login")
                        }
                        else {
                            setSubmitClicked(false)
                            // console.log(result)
                            setAuthError(result?.message)
                        }
                    } finally {
                        setLoading(false)
                    }
                }}
            >
                {(formik) => {
                    const { errors, touched, isValid, dirty, values, handleChange, handleBlur } = formik;
                    return (
                        <Form>
                            <GenericInput
                                name="fullName"
                                value={values.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={(errors.fullName && touched.fullName)}
                                touched={touched.fullName}
                                label="Full Name*"
                                type="text"
                                placeHolder='Enter your full name'
                            />

                            <GenericInput
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={(errors.email && touched.email) || authError}
                                touched={touched.email}
                                label="Email Address*"
                                type="email"
                                placeHolder='Enter your email'
                            />

                            <div className={styles["password-row"]}>
                                <GenericInput
                                    name="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={(errors.password && touched.password)}
                                    touched={touched.password}
                                    label="Create Password*"
                                    type="password"
                                    placeHolder='Enter your password'
                                />

                                <GenericInput
                                    name="confirmPassword"
                                    value={values.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={(errors.confirmPassword && touched.confirmPassword)}
                                    touched={touched.confirmPassword}
                                    label="Confirm Password*"
                                    type="password"
                                    placeHolder='Enter your password'
                                />
                            </div>
                            <GenericInput
                                name="skills"
                                value={values.skills}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={(errors.skills && touched.skills) || authError}
                                touched={touched.skills}
                                label={`Skills${isCandidate ? "*" : ""}`}
                                type="text"
                                placeHolder='Enter comma separated skills'
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
                                <GenericButton type="submit" text="Signup" disabled={submitClicked} />
                            </div>
                        </Form>
                    );
                }}
            </Formik>

            <div className={styles["login-redirect"]}>
                Have an Account?
                <Link href="/login">
                    <a className={styles['link']}>
                        Login
                    </a>
                </Link>
            </div>
            <Loader isLoading={isLoading} />
        </div>
    )
}

export default index