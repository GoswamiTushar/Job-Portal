import { Dispatch, SetStateAction } from "react"
import { Token } from "typescript"

var myHeaders = new Headers()
myHeaders.append("Content-Type", "application/json")

interface Login {
    email: string,
    password: string,
}

interface Signup {
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    skills: string,
    isRecruiter: boolean,
}

interface ForgotPassword {
    email: string,
}

interface TokenVerification {
    token: string,
}

interface ChangePassword {
    password: string,
    confirmPassword: string,
}

interface AvailableJobs {
    token: string,
    page?: string,
}

interface PostedJobs extends AvailableJobs {
}

interface PostJob {
    token: string,
    jobTitle: string,
    jobDesc: string,
    jobLocation: string,
}

interface JobApplicants {
    token: string,
    jobID: string,
}

interface ApplyJob {
    token: string | undefined | null,
    jobID: string,
}

type RequestOptions = {
    method: string,
    headers?: any,
    body?: any,
    redirect: any,
}

export async function login({ email, password }: Login) {
    var raw = JSON.stringify({
        "email": email,
        "password": password,
    })

    var requestOptions: RequestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }
    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login/`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function signup({ fullName, email, password, confirmPassword, skills, isRecruiter }: Signup) {

    var raw = JSON.stringify({
        email: email,
        name: fullName,
        password: password,
        confirmPassword: confirmPassword,
        skills: skills,
        userRole: isRecruiter ? 0 : 1
    })

    var requestOptions: RequestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/register/`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function forgotPassword({ email }: ForgotPassword) {
    var raw = JSON.stringify({
        email: email,
    })

    var requestOptions: RequestOptions = {
        method: "GET",
        redirect: 'follow'
    }

    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/resetpassword?email=${email}`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function verifyToken({ token }: TokenVerification) {
    const requestOptions: RequestOptions = {
        method: "GET",
        redirect: "follow",
    }
    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/resetpassword/${token}`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function changePassword({ password, confirmPassword }: ChangePassword) {
    var raw = JSON.stringify({
        password: password,
        confirmPassword: confirmPassword,
        token: localStorage.getItem("squareboatChangePasswordToken")
    })
    // console.log(raw)
    var requestOptions: RequestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    }
    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}auth/resetpassword`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function getAvailableJobs({ token, page }: AvailableJobs) {

    var myHeaders = new Headers();
    myHeaders.append("Authorization", token)

    var requestOptions: RequestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/candidates/jobs?page=${page}`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function getAppliedJobs({ token }: TokenVerification) {
    var myHeaders = new Headers()
    myHeaders.append("Authorization", token)
    var requestOptions: RequestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    }

    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/candidates/jobs/applied/`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function getPostedJobs({ token, page }: PostedJobs) {

    var myHeaders = new Headers()
    myHeaders.append("Authorization", token)

    var requestOptions: RequestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    }
    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/recruiters/jobs?page=${page}`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function postJob({ token, jobTitle, jobDesc, jobLocation }: PostJob) {

    var myHeaders = new Headers()
    myHeaders.append("Authorization", token)
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "title": jobTitle,
        "description": jobDesc,
        "location": jobLocation,
    })

    var requestOptions: RequestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/jobs/`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function getOneJobDetails({ token, jobID }: JobApplicants) {

    var myHeaders = new Headers();
    myHeaders.append("Authorization", token);
    var requestOptions: RequestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/recruiters/jobs/${jobID}/candidates`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function applyJob({ token, jobID }: ApplyJob) {

    var myHeaders = new Headers()
    myHeaders.append("Authorization", token as string)
    myHeaders.append("Content-Type", "application/json")
    // console.log(jobID, "\n", token)

    var raw = JSON.stringify({
        "jobId": jobID
    });

    var requestOptions: RequestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/candidates/jobs`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}