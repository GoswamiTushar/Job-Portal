import { FC, useEffect, useState } from 'react'
import GenericInput from '../../GenericInput'
import { Formik, Form } from "formik";
import GenericButton from '../../GenericButton'
import * as Yup from "yup";
import { login, postJob } from '../../../utils/apis'
import { useRouter } from 'next/router';
import Loader from '../../Loader'
import styles from './styles.module.scss'

const PostJobSchema = Yup.object().shape({
    jobTitle: Yup.string().required("Job title is required").min(6, "Minimum 6 characters").matches(/.*\S.*/, "Enter valid title").max(60, "Title too long").trim(),
    jobDesc: Yup.string().required("Description is required").min(10, "minimum 10 characters").matches(/.*\S.*/, "Enter valid description").max(400, "Description too long").trim(),
    jobLocation: Yup.string()
        .required("Location is required").matches(/^[.0-9a-zA-Z\s,-]+$/, "Only alphabets are allowed for this field ").min(3, "Must be between 3 to 100 characters").max(100, "Must be between 3 to 100 characters").trim()
});

const initialValues = {
    jobTitle: "",
    jobDesc: "",
    jobLocation: ""
};

const index = () => {
    const router = useRouter()
    const [authError, setAuthError] = useState("")
    const [isLoading, setLoading] = useState(false)
    const [submitClicked, setSubmitClicked] = useState(false)
    const [otherErrors, setOtherErrors] = useState([])


    return (
        <div className={styles['postjob-card']}>
            <header>
                <h1 className={styles["title"]}>
                    Post a job
                </h1>
            </header>
            <Formik
                initialValues={initialValues}
                validationSchema={PostJobSchema}
                onSubmit={async (values) => {
                    setLoading(true)
                    setSubmitClicked(true)
                    try {
                        const result = await postJob(
                            {
                                token: `${typeof window !== 'undefined'
                                    &&
                                    localStorage.getItem("squareboatJobPortalToken")}`,
                                jobTitle: values.jobTitle.trim(),
                                jobDesc: values.jobDesc.trim(),
                                jobLocation: values.jobLocation.trim(),
                            }
                        )
                        if (result.success === true) {
                            router.push("/postedjobs")
                        }
                        else {
                            setSubmitClicked(false)
                            setAuthError(result?.errors)
                            setOtherErrors(result?.errors)
                        }
                    }
                    finally {
                        setLoading(false)
                    }
                }}
            >
                {(formik) => {
                    const { errors, touched, isValid, dirty, values, handleChange, handleBlur } = formik;
                    return (
                        <Form>
                            <GenericInput
                                name="jobTitle"
                                value={values.jobTitle}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                touched={touched.jobTitle}
                                label="Job Title*"
                                type="text"
                                error={(errors.jobTitle && touched.jobTitle) || authError}
                                placeHolder="Enter Job title"
                            />
                            <GenericInput
                                name="jobDesc"
                                value={values.jobDesc}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                touched={touched.jobDesc}
                                label="Description*"
                                type="text"
                                error={(errors.jobDesc && touched.jobDesc) || authError}
                                placeHolder="Enter Job description"
                                component='textarea'
                                rows="6"
                            />
                            <GenericInput
                                name="jobLocation"
                                value={values.jobLocation}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                touched={touched.jobLocation}
                                label="Location*"
                                type="text"
                                error={(errors.jobLocation && touched.jobLocation) || authError}
                                placeHolder="Enter Job location"
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
                                <GenericButton
                                    text="Post"
                                    type='sumbit'
                                    disabled={submitClicked}
                                />
                            </div>
                        </Form>
                    );
                }}
            </Formik>
            <Loader isLoading={isLoading} />
        </div>
    )
}

export default index