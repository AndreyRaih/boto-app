import * as admin from "firebase-admin";

export const getDialogsById = async (id: string) => {
    return admin.firestore().collection('dialogs').doc(id);
}
