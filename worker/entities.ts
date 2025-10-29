import { IndexedEntity } from "./core-utils";
import type { Case, User } from "@shared/types";
export interface DbUser extends User {
  passwordHash: string;
}
export class CaseEntity extends IndexedEntity<Case> {
  static readonly entityName = "case";
  static readonly indexName = "cases";
  static readonly initialState: Case = {
    id: "",
    userId: "",
    courtName: "",
    parties: "",
    fileNumber: "",
    caseStatus: "",
    tarafAdi: "",
    notes: []
  };
}
export class UserEntity extends IndexedEntity<DbUser> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: DbUser = {
    id: "",
    email: "",
    passwordHash: ""
  };
  static keyOf(state: { email: string }): string {
    return state.email;
  }
}