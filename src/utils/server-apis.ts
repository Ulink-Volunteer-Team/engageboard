import { useSessionSocket } from "@/stores/session-socket";
import { useSessionCredentialStore } from "@/stores/session-credential";

export type StudentType = {
	name: string,
	id: string
}

export const login = async (id: string, password: string, sessionSocket: ReturnType<typeof useSessionSocket>, sessionCredential: ReturnType<typeof useSessionCredentialStore>) => {
	return new Promise<void>(async (resolve, reject) => {
		sessionSocket.postAES<{ token: string }>("/sign-in", {
			id: id,
			password: password
		})
			.then((data) => {
				sessionCredential.token = data.token;
				sessionCredential.userID = id;
				resolve();
			})
			.catch((error) => {
				reject(String(error).includes("API") ? "Incorrect user name or password" : "Unknown error: " + error.split(":").pop());
			})
	});
}

export const getStudentsByFuzzySearch = async (search: string, sessionSocket: ReturnType<typeof useSessionSocket>) => {
	return new Promise<StudentType[]>(async (resolve, reject) => {
		sessionSocket.postAES<{ students: StudentType[] }>("/get-students-by-fuzzy-search", {
			token: useSessionCredentialStore().token,
			name: search
		})
			.then((data) => {
				resolve(data.students);
			})
			.catch((error) => {
				reject(String(error));
			})
	});
};

export const addStudents = async (students: StudentType[], sessionSocket: ReturnType<typeof useSessionSocket>) => {
	return new Promise<void>(async (resolve, reject) => {
		sessionSocket.postAES<{ success: boolean }>("/add-students", {
			token: useSessionCredentialStore().token,
			students: students
		}).then(() => {
			resolve();
		}).catch((error) => {
			reject(String(error).includes("API") ? "Fail to add student: " + error : "Unknown error: " + error.split(":").pop());
		})
	})
}

export const removeStudent = async (id: string[], sessionSocket: ReturnType<typeof useSessionSocket>) => {
	return new Promise<void>(async (resolve, reject) => {
		sessionSocket.postAES<{ success: boolean }>("/remove-students", {
			token: useSessionCredentialStore().token,
			ids: id
		})
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(String(error));
			})
	});
};

export const getStudentByID = async (id: string, sessionSocket: ReturnType<typeof useSessionSocket>) => {
	return new Promise<{name: string}>(async (resolve, reject) => {
		sessionSocket.postAES<{ name: string }>("/get-student-by-id", {
			token: useSessionCredentialStore().token,
			id: id
		})
			.then((data) => {
				console.log(data)
				if(!data) reject("No such student");
				else resolve(data);
			})
			.catch((error) => {
				reject(String(error));
			})
	});
}

export const getTokenState = async (sessionSocket: ReturnType<typeof useSessionSocket>) => {
	return new Promise<{ valid: boolean }>(async (resolve, reject) => {
		console.log({
			tokenToCheck: useSessionCredentialStore().token,
			userID: useSessionCredentialStore().userID
		})
		sessionSocket.postAES<{ valid: boolean }>("/get-token-state", {
			tokenToCheck: useSessionCredentialStore().token,
			userID: useSessionCredentialStore().userID
		})
			.then((data) => {
				resolve(data);
			})
			.catch((error) => {
				reject(String(error));
			})
		});
}
