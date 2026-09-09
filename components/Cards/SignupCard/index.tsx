import { FC, useState } from 'react'
import OptionButton from '../../OptionButton'
import GenericInput from '../../GenericInput'
import { Formik, Form } from "formik";
import GenericButton from '../../GenericButton'
import * as Yup from "yup";
import { signup } from '../../../utils/apis'
import Link from 'next/link';
import { icons } from './_icons'
import styles from './styles.module.scss'
import { useRouter } from 'next/router';
import Loader from '../../Loader';
import SocialAuth from '../../SocialAuth';

const initialValues = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Candidate specific
    headline: "",
    experienceLevel: "1-3 yrs",
    workplacePreference: "Remote",
    skills: "",
    // Recruiter specific
    recruiterType: "corporate",
    companyName: "",
    designation: "",
    companyWebsite: "",
};

const nameRegex = /^[a-zA-Z\s.'-]+$/;

const SignUpSchemaRecruiter = Yup.object().shape({
    fullName: Yup.string()
        .required("Full name is mandatory.")
        .matches(nameRegex, "Enter a valid name (letters & spaces)")
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),

    email: Yup.string()
        .email("Invalid work email address.")
        .max(80, "Email address is too long")
        .required("Work email is required"),

    companyName: Yup.string()
        .required("Company name is required.")
        .min(2, "Company name is too short")
        .max(100, "Company name is too long"),

    designation: Yup.string()
        .required("Your designation/role is required.")
        .min(2, "Designation is too short")
        .max(100, "Designation is too long"),

    companyWebsite: Yup.string()
        .url("Enter a valid URL (e.g. https://company.com)")
        .optional(),

    password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(50, "Password is too long"),

    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required("Confirm password is required."),
});

const SignUpSchemaCandidate = Yup.object().shape({
    fullName: Yup.string()
        .required("Full name is mandatory.")
        .matches(nameRegex, "Enter a valid name (letters & spaces)")
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),

    email: Yup.string()
        .email("Invalid email address.")
        .required("Email address is required"),

    headline: Yup.string()
        .required("Professional title/headline is required")
        .min(2, "Headline must be at least 2 characters")
        .max(100, "Headline cannot exceed 100 characters"),

    skills: Yup.string()
        .required("Enter at least one key skill")
        .min(2, "Enter at least 2 characters for skills")
        .max(200, "Skills list is too long"),

    password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(50, "Password is too long"),

    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required("Confirm password is required."),
});

const QUICK_SKILLS = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'AWS', 'SQL', 'UI/UX'];
const EXPERIENCE_LEVELS = ['Fresher (<1 yr)', '1-3 yrs', '3-5 yrs', '5-8 yrs', '8+ yrs'];
const WORKPLACE_PREFERENCES = ['Remote', 'Hybrid', 'In-Office', 'Open to Any'];

const index: FC = () => {
    const router = useRouter()
    const [isRecruiter, setIsRecruiter] = useState(false)
    const [isCandidate, setIsCandidate] = useState(true)
    const [authError, setAuthError] = useState("")
    const [isLoading, setLoading] = useState(false)
    const [submitClicked, setSubmitClicked] = useState(false)

    return (
        <div className={styles['signup-card']}>
            <header>
                <h1 className={styles["title"]}>
                    Create Your Account
                </h1>
                <p className={styles["subtitle"]}>
                    {isRecruiter
                        ? 'Connect with top-tier talent & scale your hiring effortlessly.'
                        : 'Discover hand-curated roles & accelerate your career.'}
                </p>
            </header>

            <div className={styles["role-selection"]}>
                <p className={styles["label"]}>
                    I want to register as*
                </p>
                <div className={styles["wrapper"]}>
                    <OptionButton
                        unselect={setIsRecruiter}
                        setIsSelected={setIsCandidate}
                        isSelected={isCandidate}
                        text="Candidate"
                        iconURL={isCandidate ? icons.candidateWhite : icons.candidateBlue} />

                    <OptionButton
                        unselect={setIsCandidate}
                        setIsSelected={setIsRecruiter}
                        isSelected={isRecruiter}
                        text="Recruiter / Employer"
                        iconURL={isRecruiter ? icons.recruiterWhite : icons.recruiterBlue} />
                </div>
            </div>

            {/* Social OAuth Available for BOTH Candidate & Recruiter */}
            <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                <SocialAuth
                    mode="signup"
                    role={isRecruiter ? 'recruiter' : 'candidate'}
                    isCandidate={isCandidate}
                />
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={
                    isCandidate ? SignUpSchemaCandidate : SignUpSchemaRecruiter
                }
                onSubmit={async (values) => {
                    setLoading(true)
                    setSubmitClicked(true)
                    setAuthError("")
                    try {
                        const result = await signup({
                            fullName: values.fullName,
                            email: values.email,
                            password: values.password,
                            confirmPassword: values.confirmPassword,
                            skills: values.skills,
                            isRecruiter: isRecruiter,
                            headline: values.headline,
                            experienceLevel: values.experienceLevel,
                            workplacePreference: values.workplacePreference,
                            companyName: values.companyName,
                            companyWebsite: values.companyWebsite,
                            designation: values.designation,
                            recruiterType: values.recruiterType,
                        })

                        if (result?.success === true) {
                            // Automatically signed in via HttpOnly cookie
                            const destination = isRecruiter ? "/postedjobs" : "/dashboard";
                            router.push(destination);
                        } else {
                            setSubmitClicked(false)
                            setAuthError(result?.message || 'Registration failed. Please try again.')
                        }
                    } catch (err: any) {
                        setSubmitClicked(false)
                        setAuthError(err?.message || 'A network error occurred.')
                    } finally {
                        setLoading(false)
                    }
                }}
            >
                {(formik) => {
                    const { errors, touched, values, handleChange, handleBlur, setFieldValue } = formik;

                    const handleAddSkillChip = (skillToAdd: string) => {
                        const current = values.skills ? values.skills.trim() : '';
                        if (!current) {
                            setFieldValue('skills', skillToAdd);
                            return;
                        }
                        const list = current.split(',').map(s => s.trim().toLowerCase());
                        if (!list.includes(skillToAdd.toLowerCase())) {
                            setFieldValue('skills', `${current}, ${skillToAdd}`);
                        }
                    };

                    return (
                        <Form>
                            {/* Basic Account Info */}
                            <div className={styles["form-section-title"]}>
                                <span>1. Account Credentials</span>
                            </div>

                            <GenericInput
                                name="fullName"
                                value={values.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={(errors.fullName && touched.fullName)}
                                touched={touched.fullName}
                                label="Full Name*"
                                type="text"
                                placeHolder="e.g. Alex Morgan"
                            />

                            <GenericInput
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={(errors.email && touched.email) || (authError && authError.includes('email'))}
                                touched={touched.email}
                                label={isRecruiter ? "Work Email Address*" : "Email Address*"}
                                type="email"
                                placeHolder={isRecruiter ? "alex@company.com" : "alex@example.com"}
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
                                    placeHolder="At least 6 characters"
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
                                    placeHolder="Repeat password"
                                />
                            </div>

                            {/* Candidate Specific Fields */}
                            {isCandidate && (
                                <>
                                    <div className={styles["form-section-title"]}>
                                        <span>2. Professional Profile</span>
                                    </div>

                                    <GenericInput
                                        name="headline"
                                        value={values.headline}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={(errors.headline && touched.headline)}
                                        touched={touched.headline}
                                        label="Professional Title / Headline*"
                                        type="text"
                                        placeHolder="e.g. Full Stack Developer | React & Node.js"
                                    />

                                    {/* Experience Level Selector */}
                                    <div className={styles["custom-select-group"]}>
                                        <label className={styles["group-label"]}>Experience Level*</label>
                                        <div className={styles["pills-container"]}>
                                            {EXPERIENCE_LEVELS.map((level) => (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    className={`${styles["pill-btn"]} ${values.experienceLevel === level ? styles["active"] : ""}`}
                                                    onClick={() => setFieldValue('experienceLevel', level)}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Workplace Preference */}
                                    <div className={styles["custom-select-group"]}>
                                        <label className={styles["group-label"]}>Workplace Preference*</label>
                                        <div className={styles["pills-container"]}>
                                            {WORKPLACE_PREFERENCES.map((pref) => (
                                                <button
                                                    key={pref}
                                                    type="button"
                                                    className={`${styles["pill-btn"]} ${values.workplacePreference === pref ? styles["active"] : ""}`}
                                                    onClick={() => setFieldValue('workplacePreference', pref)}
                                                >
                                                    {pref}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Skills Input + Quick Chips */}
                                    <GenericInput
                                        name="skills"
                                        value={values.skills}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={(errors.skills && touched.skills)}
                                        touched={touched.skills}
                                        label="Key Skills (comma separated)*"
                                        type="text"
                                        placeHolder="e.g. React, Next.js, Node.js, TypeScript"
                                    />

                                    <div className={styles["quick-chips-wrapper"]}>
                                        <span className={styles["chips-label"]}>Quick Add:</span>
                                        {QUICK_SKILLS.map((skill) => (
                                            <button
                                                key={skill}
                                                type="button"
                                                className={styles["chip-tag"]}
                                                onClick={() => handleAddSkillChip(skill)}
                                            >
                                                + {skill}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Recruiter Specific Fields */}
                            {isRecruiter && (
                                <>
                                    <div className={styles["form-section-title"]}>
                                        <span>2. Organization & Hiring Details</span>
                                    </div>

                                    {/* Recruiter Type */}
                                    <div className={styles["custom-select-group"]}>
                                        <label className={styles["group-label"]}>Recruiting For*</label>
                                        <div className={styles["pills-container"]}>
                                            <button
                                                type="button"
                                                className={`${styles["pill-btn"]} ${values.recruiterType === 'corporate' ? styles["active"] : ""}`}
                                                onClick={() => setFieldValue('recruiterType', 'corporate')}
                                            >
                                                🏢 Corporate / In-House Team
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles["pill-btn"]} ${values.recruiterType === 'agency' ? styles["active"] : ""}`}
                                                onClick={() => setFieldValue('recruiterType', 'agency')}
                                            >
                                                🤝 Staffing Agency / Consultant
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles["two-col"]}>
                                        <GenericInput
                                            name="companyName"
                                            value={values.companyName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={(errors.companyName && touched.companyName)}
                                            touched={touched.companyName}
                                            label="Company Name*"
                                            type="text"
                                            placeHolder="e.g. Stripe / Acme Corp"
                                        />

                                        <GenericInput
                                            name="designation"
                                            value={values.designation}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={(errors.designation && touched.designation)}
                                            touched={touched.designation}
                                            label="Your Designation / Role*"
                                            type="text"
                                            placeHolder="e.g. Talent Acquisition Lead"
                                        />
                                    </div>

                                    <GenericInput
                                        name="companyWebsite"
                                        value={values.companyWebsite}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={(errors.companyWebsite && touched.companyWebsite)}
                                        touched={touched.companyWebsite}
                                        label="Company Website / Domain (optional)"
                                        type="url"
                                        placeHolder="https://yourcompany.com"
                                    />
                                </>
                            )}

                            {authError && (
                                <div className={styles["auth-error"]}>
                                    <p className={styles['message']}>
                                        {authError}
                                    </p>
                                </div>
                            )}

                            <div className={styles["btn-container"]}>
                                <GenericButton
                                    type="submit"
                                    text={isRecruiter ? "Create Recruiter Account" : "Create Candidate Account"}
                                    disabled={submitClicked}
                                />
                            </div>
                        </Form>
                    );
                }}
            </Formik>

            <div className={styles["login-redirect"]}>
                Already have an account?
                <Link href="/login" className={styles['link']}>
                    Login
                </Link>
            </div>
            <Loader isLoading={isLoading} />
        </div>
    )
}

export default index