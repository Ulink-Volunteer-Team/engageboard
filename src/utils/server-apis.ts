import { useSessionSocket } from "@/stores/session-socket";
import { useSessionCredentialStore } from "@/stores/session-credential";

export type StudentType = {
	name: string,
	id: string
}

export type EventRecordType = {
	eventID: string,
    studentID: string,
}

export type RecruitmentDataType = {
	id?: string;
    department: string;
    formFilledBy: string;
    eventName: string;
    eventTime: number;
    volunteerHours: number;
    additionalNotes: string;
}

export const login = async (id: string, password: string, sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<void>(async (resolve, reject) => {
		sessionSocket.postAES<{ token: string }>("/sign-in", {
			id: id,
			password: password,
		})
			.then((data) => {
				sessionCredential.token = data.token;
				sessionCredential.userID = id;
				resolve();
			})
			.catch((error) => {
				reject(String(error).includes("API") ? "Incorrect user name or password" : "Unknown error: " + error.split(":").pop());
			});
	});
};

export const getStudentsByFuzzySearch = async (search: string, sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<StudentType[]>(async (resolve, reject) => {
		sessionSocket.postAES<{ students: StudentType[] }>("/get-students-by-fuzzy-search", {
			token: sessionCredential.token,
			name: search,
		})
			.then((data) => {
				resolve(data.students);
			})
			.catch((error) => {
				reject(String(error));
			});
	});
};

export const addStudents = async (students: StudentType[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<void>(async (resolve, reject) => {
		sessionSocket.postAES<{ success: boolean }>("/add-students", {
			token: sessionCredential.token,
			students: students,
		}).then(() => {
			resolve();
		}).catch((error) => {
			reject(String(error).includes("API") ? "Fail to add student: " + error : "Unknown error: " + error.split(":").pop());
		});
	});
};

export const updateStudents = async (students: StudentType[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<void>(async (resolve, reject) => {
		sessionSocket.postAES<{ success: boolean }>("/update-students", {
			token: sessionCredential.token,
			students: students,
		}).then(() => {
			resolve();
		}).catch((error) => {
			reject(String(error).includes("API") ? "Fail to update student: " + error : "Unknown error: " + error.split(":").pop());
		});
	});
};

export const removeStudent = async (ids: string[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<void>(async (resolve, reject) => {
		sessionSocket.postAES<{ success: boolean }>("/remove-students", {
			token: sessionCredential.token,
			ids: ids,
		})
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(String(error));
			});
	});
};

export const getStudentByID = async (id: string, sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<{name: string}>(async (resolve, reject) => {
		sessionSocket.postAES<{ name: string }>("/get-student-by-id", {
			token: sessionCredential.token,
			id: id,
		})
			.then((data) => {
				if(!data) reject("No such student");
				else resolve(data);
			})
			.catch((error) => {
				reject(String(error));
			});
	});
};

export const getStudentsByIDs = async (ids: string[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<StudentType[]>(async (resolve, reject) => {
		sessionSocket.postAES<{ students: StudentType[] }>("/get-students-by-ids", {
			token: sessionCredential.token,
			ids: ids,
		})
			.then((data) => {
				if(!data) reject("No such student");
				else resolve(data.students);
			})
			.catch((error) => {
				reject(String(error));
			});
	});
};

export const getTokenState = async (sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<{ valid: boolean }>(async (resolve, reject) => {
		sessionSocket.postAES<{ valid: boolean }>("/get-token-state", {
			tokenToCheck: sessionCredential.token,
			userID: sessionCredential.userID,
		})
			.then((data) => {
				resolve(data);
			})
			.catch((error) => {
				reject(String(error));
			});
		});
};

export const getRecruitmentsByIDs = async (ids: string[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<RecruitmentDataType[]>(async (resolve, reject) => {
		sessionSocket.postAES<{ recruitments: RecruitmentDataType[] }>("/get-recruitments-by-ids", {
			token: sessionCredential.token,
			ids: ids,
		})
			.then((data) => {
				resolve(data.recruitments);
			})
			.catch((error) => {
				reject(String(error));
			});
	});
};

export const getRecruitmentsByFuzzySearch = async (values: string[], fields: ("department" | "formFilledBy" | "eventName")[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<RecruitmentDataType[]>(async (resolve, reject) => {
		sessionSocket.postAES<{ recruitments: RecruitmentDataType[] }>("/get-recruitments-by-fuzzy-search", {
			token: sessionCredential.token,
			fields: fields,
			values: values,
		})
			.then((data) => {
				resolve(data.recruitments);
			})
			.catch((error) => {
				reject(String(error));
			});
	});
};

export const addRecruitments = async (recruitments: RecruitmentDataType[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<void>(async (resolve, reject) => {
		sessionSocket.postAES<{ success: boolean }>("/add-recruitments", {
			token: sessionCredential.token,
			recruitments: recruitments,
		})
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(String(error).includes("API") ? "Fail to add recruitment: " + error : "Unknown error: " + error.split(":").pop());
			});
	});
};

export const deleteRecruitments = async (ids: string[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<void>(async (resolve, reject) => {
		sessionSocket.postAES<{ success: boolean }>("/delete-recruitments", {
			token: sessionCredential.token,
			ids: ids,
		})
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(String(error));
			});
	});
};

export const getRecruitmentByID = async (id: string, sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<RecruitmentDataType>(async (resolve, reject) => {
		sessionSocket.postAES<{ recruitment: RecruitmentDataType }>("/get-recruitment-by-id", {
			token: sessionCredential.token,
			id: id,
		})
			.then((data) => {
				resolve(data.recruitment);
			})
			.catch((error) => {
				reject(String(error));
			});
	});
};

export const getAllRecruitmentInfo = async (sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<{eventName: string, id: string}[]>(async (resolve, reject) => {
		sessionSocket.postAES<{ recruitments: {eventName: string, id: string}[] }>("/get-all-recruitment-info", {
			token: sessionCredential.token,
		})
			.then((data) => {
				resolve(data.recruitments);
			})
			.catch((error) => {
				reject(String(error));
			});
	});
};

export const getAllStudents = async (sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<StudentType[]>(async (resolve, reject) => {
		sessionSocket.postAES<{ students: StudentType[] }>("/get-all-students", {
			token: sessionCredential.token,
		})
			.then((data) => {
				resolve(data.students);
			})
			.catch((error) => {
				reject(String(error));
			});
	});
};

export const getVolunteersIDsByRecruitmentIDs = async (ids: string[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<[string, string[]][]>(async (resolve, reject) => {
		sessionSocket.postAES<{ volunteers: [string, string[]][] }>("/get-volunteers-by-recruitment", {
			token: sessionCredential.token,
			ids: ids,
		})
			.then((data) => {
				resolve(data.volunteers);
			})
			.catch((error) => {
				reject(String(error));
			});
	});
};

export const getRecruitmentIDsByVolunteerIDs = async (ids: string[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<[string, string[]][]>(async (resolve, reject) => {
		sessionSocket.postAES<{ volunteers: [string, string[]][] }>("/get-recruitments-by-volunteers", {
			token: sessionCredential.token,
			ids: ids,
		})
			.then((data) => {
				resolve(data.volunteers);
			})
			.catch((error) => {
				reject(String(error));
			});
	});
};

export const updateRecruitments = async (recruitments: RecruitmentDataType[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<void>(async (resolve, reject) => {
		sessionSocket.postAES<{ success: boolean }>("/update-recruitments", {
			token: sessionCredential.token,
			recruitments: recruitments,
		})
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(String(error).includes("API") ? "Fail to update recruitment: " + error : "Unknown error: " + error.split(":").pop());
			});
	});
};

export const addEventRecords = async (eventRecords: EventRecordType[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<void>(async (resolve, reject) => {
		sessionSocket.postAES<{ success: boolean }>("/add-event-records", {
			token: sessionCredential.token,
			records: eventRecords,
		})
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(String(error).includes("API") ? "Fail to add event record: " + error : "Unknown error: " + error.split(":").pop());
			});
	});
};

export const updateRecordsOfAStudent = async (studentID: string, eventIDs: string[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<void>(async (resolve, reject) => {
		sessionSocket.postAES<{ success: boolean }>("/update-events-of-a-student", {
			token: sessionCredential.token,
			studentID,
        	eventIDs,
		})
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(String(error).includes("API") ? "Fail to update records of a student: " + error : "Unknown error: " + error.split(":").pop());
			});
	});
};

export const updateStudentsOfAnEvent = async (eventID: string, studentIDs: string[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<void>(async (resolve, reject) => {
		sessionSocket.postAES<{ success: boolean }>("/update-students-of-an-event", {
			token: sessionCredential.token,
			eventID,
			studentIDs,
		})
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(String(error).includes("API") ? "Fail to update students of an event: " + error : "Unknown error: " + error.split(":").pop());
			});
	});
};

export const calculateVolunteerHours = async (ids: string[], sessionSocket: Awaited<ReturnType<typeof useSessionSocket>>, sessionCredential: Awaited<ReturnType<typeof useSessionCredentialStore>>) => {
	return new Promise<Record<string, number>>(async (resolve, reject) => {
		sessionSocket.postAES<{ hours: Record<string, number> }>("/calculate-volunteer-hours", {
			token: sessionCredential.token,
			ids: ids,
		})
			.then((data) => {
				resolve(data.hours);
			})
			.catch((error) => {
				reject(String(error).includes("API") ? "Fail to calculate volunteer hours: " + error : "Unknown error: " + error.split(":").pop());
			});
		});
};
