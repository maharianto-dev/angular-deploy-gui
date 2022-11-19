export class AppService {
  private static _projectList: String[] = [];

  public static setProjectList(
    value: string | String[],
    overwrite: boolean = false
  ) {
    if (value === typeof String) {
      if (overwrite) {
        this._projectList = [value];
      } else {
        this._projectList = [...this._projectList, value];
      }
    } else if (Array.isArray(value)) {
      if (overwrite) {
        this._projectList = [...value];
      } else {
        this._projectList = [...this._projectList, ...value];
      }
    }
  }

  public static getProjectList(): String[] {
    return this._projectList;
  }
}
