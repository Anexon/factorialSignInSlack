import express, { Router } from "express";
import { checkIn, checkOut, login } from "../services/factorial";
import { getUserEmail, getUserTimeZone, postWelcome } from "../services/slack";

const router = Router();

const accesses: Array<{userEmail: string, accessToken: string, userTimeZone: number}> = [];

router.all("/commands", async (req, res) => {
    const text: string = req.body.text;
    const channel: string = req.body.channel_id;
    const userId: string = req.body.user_id;
    const userEmail = await getUserEmail(userId);
    const userTimeZone = await getUserTimeZone(userId);
    const timeString = (new Date()).toTimeString().split(" ")[0];
    const time = `${timeString.split(":")[0]}:${timeString.split(":")[1]}`;

    let status = 200;
    let outputText = "";
    let standardCommand = true;
    let access: {userEmail: string, accessToken: string, userTimeZone: number};

    console.log("Launching command: " + req.body.command);
    console.log("Current Accesses: ");
    console.log(accesses);

    if ( req.body.command == "/factorial-login" || req.body.command == "/factorial-help" ||
        accesses.some((myAccess) => myAccess.userEmail == userEmail) ) {
 
        switch (req.body.command) {
            case "/factorial-help":
                outputText = `Esta integración con factorial te permitirá controlar el fichaje horario de tu perfil:\n
                1. Enlaza tu cuenta de factorial: /factorial-login _escribe tu contraseña de factorial_\n
                2. Fichar hora de entrada: /check-in _escribe tus buenos días_\n
                3. Fichar hora de descanso: /take-brake _avisa a tus compañeros_\n
                4. Fichar hora de vuelta del descanso: /resume-shift _avisa a tus compañeros_\n
                5. Fichar hora de salida: /check-out _despidete de tus compañeros_\n

                No es necesario que introduzcas las contraseña todos los días, una vez será suficiente.
                `;
                break;
            case "/factorial-login":
                const token = await login(userEmail, text);
                if (token !== undefined) {
                    outputText = "Acceso exitoso";
                    let previusAccess = accesses.find( myAccess => myAccess.userEmail == userEmail);

                    if(previusAccess !== undefined){
                        previusAccess.accessToken = token;
                    } else {
                        accesses.push({userEmail, accessToken: token, userTimeZone});
                    }
                } else {
                    outputText = "Usuario y/o contraseña inválidos";
                }
                standardCommand = false;
                break;
            case "/check-in":
                access = accesses.find((myAccess) => myAccess.userEmail == userEmail);
                checkIn(access.userEmail, access.accessToken, access.userTimeZone);
                outputText = `Hora de entrada: ${time}`;
                break;
            case "/check-out":
                access = accesses.find((myAccess) => myAccess.userEmail == userEmail);
                checkOut(access.userEmail, access.accessToken, access.userTimeZone);
                outputText = `Hora de salida: ${time}`;
                break;
            case "/take-break":
                access = accesses.find((myAccess) => myAccess.userEmail == userEmail);
                checkOut(access.userEmail, access.accessToken, access.userTimeZone);
                outputText = `Hora de pausa: ${time}`;
                break;
            case "/resume-shift":
                access = accesses.find((myAccess) => myAccess.userEmail == userEmail);
                checkIn(access.userEmail, access.accessToken, access.userTimeZone);
                outputText = `Hora de vuelta: ${time}`;
                break;
        }
    } else {
        standardCommand = false;
        outputText = "Debes estar logueado para poder realizar cualquier acción";
    }
    res.status(status).send(outputText);

    if (standardCommand) {
        await postWelcome(channel, text)
        .catch(() => {
            status = 503;
        });
    }
});

export default router;
