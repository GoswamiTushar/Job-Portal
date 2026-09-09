const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || '/api').replace(/\/+$/, '')

interface Login {
    email: string,
    password: string,
}

interface Signup {
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    skills?: string,
    isRecruiter: boolean,
    headline?: string,
    experienceLevel?: string,
    workplacePreference?: string,
    phone?: string,
    companyName?: string,
    companyWebsite?: string,
    designation?: string,
    recruiterType?: string,
}

interface ForgotPassword {
    email: string,
}

interface TokenVerification {
    token?: string,
}

interface ChangePassword {
    password: string,
    confirmPassword: string,
}

interface AvailableJobs {
    token?: string,
    page?: string,
}

interface PostedJobs extends AvailableJobs {
}

interface PostJob {
    token?: string,
    jobTitle: string,
    jobDesc: string,
    jobLocation: string,
}

interface JobApplicants {
    token?: string,
    jobID: string,
}

interface ApplyJob {
    token?: string | undefined | null,
    jobID: string,
}

type RequestOptions = {
    method: string,
    headers?: any,
    body?: any,
    redirect?: RequestRedirect,
    credentials?: RequestCredentials,
}

function getJsonHeaders(extraHeaders: Record<string, string> = {}) {
    const headers = new Headers()
    headers.append("Content-Type", "application/json")
    for (const [key, val] of Object.entries(extraHeaders)) {
        if (val) headers.append(key, val)
    }
    return headers
}

export async function login({ email, password }: Login) {
    var raw = JSON.stringify({
        "email": email,
        "password": password,
    })

    var requestOptions: RequestOptions = {
        method: 'POST',
        headers: getJsonHeaders(),
        body: raw,
        redirect: 'follow',
        credentials: 'include',
    }
    try {
        const result = await fetch(`${BASE_URL}/auth/login`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function signup({
    fullName,
    email,
    password,
    confirmPassword,
    skills,
    isRecruiter,
    headline,
    experienceLevel,
    workplacePreference,
    phone,
    companyName,
    companyWebsite,
    designation,
    recruiterType,
}: Signup) {
    var raw = JSON.stringify({
        email: email,
        name: fullName,
        password: password,
        confirmPassword: confirmPassword,
        skills: skills,
        userRole: isRecruiter ? 0 : 1,
        headline,
        experienceLevel,
        workplacePreference,
        phone,
        companyName,
        companyWebsite,
        designation,
        recruiterType,
    })

    var requestOptions: RequestOptions = {
        method: 'POST',
        headers: getJsonHeaders(),
        body: raw,
        redirect: 'follow',
        credentials: 'include',
    };
    try {
        const result = await fetch(`${BASE_URL}/auth/register`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function getCurrentUser() {
    var requestOptions: RequestOptions = {
        method: 'GET',
        headers: getJsonHeaders(),
        credentials: 'include',
    }
    try {
        const result = await fetch(`${BASE_URL}/auth/me`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function logoutUser() {
    var requestOptions: RequestOptions = {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include',
    }
    try {
        const result = await fetch(`${BASE_URL}/auth/logout`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function forgotPassword({ email }: ForgotPassword) {
    var requestOptions: RequestOptions = {
        method: "GET",
        redirect: 'follow',
        credentials: 'include',
    }

    try {
        const result = await fetch(`${BASE_URL}/auth/resetpassword?email=${encodeURIComponent(email)}`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function verifyToken({ token }: TokenVerification) {
    const requestOptions: RequestOptions = {
        method: "GET",
        redirect: "follow",
        credentials: 'include',
    }
    try {
        const result = await fetch(`${BASE_URL}/auth/resetpassword/${token}`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function changePassword({ password, confirmPassword }: ChangePassword) {
    var raw = JSON.stringify({
        password: password,
        confirmPassword: confirmPassword,
        token: typeof window !== 'undefined' ? localStorage.getItem("squareboatChangePasswordToken") : null
    })
    var requestOptions: RequestOptions = {
        method: "POST",
        headers: getJsonHeaders(),
        body: raw,
        redirect: "follow",
        credentials: 'include',
    }
    try {
        const result = await fetch(`${BASE_URL}/auth/resetpassword`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function getAvailableJobs({ token, page }: AvailableJobs) {
    var myHeaders = new Headers();
    if (token && token !== 'undefined') {
        myHeaders.append("Authorization", token)
    }

    var requestOptions: RequestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        credentials: 'include',
    };

    try {
        const result = await fetch(`${BASE_URL}/candidates/jobs?page=${page || 1}`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function getAppliedJobs({ token }: TokenVerification) {
    var myHeaders = new Headers()
    if (token && token !== 'undefined') {
        myHeaders.append("Authorization", token)
    }
    var requestOptions: RequestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        credentials: 'include',
    }

    try {
        const result = await fetch(`${BASE_URL}/candidates/jobs/applied`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function getPostedJobs({ token, page }: PostedJobs) {
    var myHeaders = new Headers()
    if (token && token !== 'undefined') {
        myHeaders.append("Authorization", token)
    }

    var requestOptions: RequestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        credentials: 'include',
    }
    try {
        const result = await fetch(`${BASE_URL}/recruiters/jobs?page=${page || 1}`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function postJob({ token, jobTitle, jobDesc, jobLocation }: PostJob) {
    var raw = JSON.stringify({
        "title": jobTitle,
        "description": jobDesc,
        "location": jobLocation,
    })

    const extra: Record<string, string> = {}
    if (token && token !== 'undefined') {
        extra["Authorization"] = token
    }

    var requestOptions: RequestOptions = {
        method: 'POST',
        headers: getJsonHeaders(extra),
        body: raw,
        redirect: 'follow',
        credentials: 'include',
    };

    try {
        const result = await fetch(`${BASE_URL}/jobs`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function getOneJobDetails({ token, jobID }: JobApplicants) {
    var myHeaders = new Headers();
    if (token && token !== 'undefined') {
        myHeaders.append("Authorization", token);
    }
    var requestOptions: RequestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        credentials: 'include',
    };

    try {
        const result = await fetch(`${BASE_URL}/recruiters/jobs/${jobID}/candidates`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}

export async function applyJob({ token, jobID }: ApplyJob) {
    var raw = JSON.stringify({
        "jobId": jobID
    });

    const extra: Record<string, string> = {}
    if (token && token !== 'undefined') {
        extra["Authorization"] = token
    }

    var requestOptions: RequestOptions = {
        method: 'POST',
        headers: getJsonHeaders(extra),
        body: raw,
        redirect: 'follow',
        credentials: 'include',
    };

    try {
        const result = await fetch(`${BASE_URL}/candidates/jobs`, requestOptions)
        return result.json()
    } catch (error) {
        return error
    }
}