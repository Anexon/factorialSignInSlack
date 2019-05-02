import axios from "axios";
import querystring from "querystring";

const options = {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "https://factorialhr.com/users/sign_in"
    }
};

export async function login(userEmail: string, password: string) {
    const accessToken = await getFactorialSessionToken(userEmail, password);
    return accessToken;
}
export function checkIn(userEmail: string, accessToken: string) {

    getUserInfo(userEmail, accessToken, (userId: string, accessId: string, employeeId: string,
                                         periodId: string, cookieToken: string) => {
        initShift(periodId, cookieToken);
    });
}
export function checkOut(userEmail: string, accessToken: string) {

    getUserInfo(userEmail, accessToken, (userId: string, accessId: string, employeeId: string,
                                         periodId: string, cookieToken: string) => {
        finishShift(periodId, accessToken);
    });
}

async function getUserInfo( userEmail: string,
                            accessToken: string,
                            onUserInfo: (
                                userId: string,
                                accessId: string,
                                employeeId?: string,
                                periodId?: string,
                                cookieToken?: string
                                ) => void) {
    const {userId, accessId} = await getFactorialUserAndAccessIds(userEmail, accessToken);
    const employeeId = await getFactorialEmployeeId(accessId, accessToken);
    const periodId = await getFactorialPeriodId(employeeId, accessToken);

    onUserInfo(userId, accessId, employeeId, periodId, accessToken);
}

async function getFactorialSessionToken(userEmail: string, userPassword: string) {
    const data = querystring.stringify({
        "user[email]": userEmail,
        "user[password]": userPassword,
        "user[remember_me]": 0
    });
    let token: string;
    options.headers = Object.assign({}, {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "https://factorialhr.com/users/sign_in"
    });

    try {
        const res = await axios.post(
            "https://api.factorialhr.com/sessions",
            data,
            options
        );
        res.headers["set-cookie"].forEach((header: string) => {
            if (header.includes("_factorial_session")) {
                token = header;
            }
        });

        return token;
    } catch {
        console.error("Error al obtener el token de session de Factorial");
        return undefined;
    }
}

async function initShift(periodId: string, cookieToken: string) {
    const date = new Date();
    const currentDay = date.getDate();
    const clockIn = date.toTimeString().split(" ")[0].split(":");

    const data: any = {
        clock_in: `${clockIn[0]}:${clockIn[1]}`,
        clock_out: null,
        day: currentDay,
        hours_in_cents: 0,
        period_id: periodId,
    };

    try {

        options.headers = Object.assign({}, {
            "Content-Type": "application/json",
            "Referer": `https://app.factorialhr.com/attendance/clock-in/${date.getFullYear()}/${currentDay}`,
            "Cookie": cookieToken
        });
        axios.post(
            "https://api.factorialhr.com/attendance/shifts",
            data,
            options
        );
    } catch {
        console.error("Error al iniciar el turno en Factorial");
    }
}

async function finishShift(periodId: string, cookieToken: string) {
    const date = new Date();
    const currentDay = date.getDate();
    const clockOut = date.toTimeString().split(" ")[0].split(":");

    const activeShift: any = await getFactorialActiveShift(periodId, cookieToken);

    const data: any = {
        clock_in: activeShift.clock_in,
        clock_out: `${clockOut[0]}:${clockOut[1]}`
    };

    try {
        options.headers = Object.assign({}, {
            "Content-Type": "application/json",
            "Referer": `https://app.factorialhr.com/attendance/clock-in/${date.getFullYear()}/${currentDay}`,
            "Cookie": cookieToken
        });
        axios.patch(
            `https://api.factorialhr.com/attendance/shifts/${activeShift.id}`,
            data,
            options
        );
    } catch {
        console.error("Error al finalizar el turno en Factorial");
    }
}

async function getFactorialUserAndAccessIds(userEmail: string, cookie: string) {
    let userId: string = "";
    let accessId: string = "";
    options.headers = Object.assign({Cookie: cookie});

    try {
        const res = await axios.get(
            "https://api.factorialhr.com/accesses",
            options
        );
        res.data.forEach((access: any) => {
            if (access.email == userEmail) {
                userId = access.user_id;
                accessId = access.id;
            }
        });

        return {userId, accessId};
    } catch {
        console.error("Error al obtener el Id del usuario de Factorial");
    }
}

async function getFactorialEmployeeId(accessId: string, cookie: string) {
    let employeeId: string = "";

    options.headers = Object.assign({Cookie: cookie});
    try {
        const res = await axios.get(
            "https://api.factorialhr.com/employees",
            options
        );
        res.data.forEach((employee: any) => {
            if (employee.access_id == accessId) {
                employeeId = employee.id;
            }
        });

        return employeeId;
    } catch {
        console.error("Error al obtener el Id del empleado de Factorial");
    }
}

async function getFactorialPeriodId(employeeId: string, cookie: string) {
    let periodId: string = "";

    options.headers = Object.assign({Cookie: cookie});
    try {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const res = await axios.get(
            `https://api.factorialhr.com/attendance/periods?year=${year}&month=${month + 1}&employee_id=${employeeId}`,
            options
        );
        res.data.forEach((period: any) => {
            if (period.employee_id == employeeId) {
                periodId = period.id;
            }
        });

        return periodId;
    } catch {
        console.error("Error al obtener el Id del periodo de Factorial");
    }
}

async function getFactorialActiveShift(periodId: string, cookie: string) {

    options.headers = Object.assign({Cookie: cookie});
    try {
        const res = await axios.get(
            `https://api.factorialhr.com/attendance/shifts?period_id=${periodId}`,
            options
        );

        return res.data[res.data.length - 1];
    } catch {
        console.error("Error al obtener el turno activo de Factorial");
    }
}
