use std::{
    error::Error,
    fs::File,
    io::BufReader,
    path::{Path, PathBuf},
};

use log::{error, info};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use itertools::Itertools;

#[derive(Serialize, Deserialize, Debug)]
pub struct AngularConfigJSONStruct;

pub fn get_angular_json_configs(angular_json_path: &PathBuf) -> Result<Value, Box<dyn Error>> {
    let angular_json_file = File::open(angular_json_path)?;
    let angular_json_reader = BufReader::new(angular_json_file);
    let angular_json_content: Value = serde_json::from_reader(angular_json_reader)?;
    Ok(angular_json_content)
}

#[derive(Clone)]
pub struct AppNamesStruct<'a> {
    pub core_app_names: Vec<&'a str>,
    pub portal_app_names: Vec<&'a str>,
}

pub fn get_app_names(app_names: &[String]) -> Result<AppNamesStruct, Box<dyn Error>> {
    let mut retval = AppNamesStruct {
        core_app_names: vec![],
        portal_app_names: vec![],
    };
    for ii in 0..app_names.len() {
        if app_names[ii].as_str().ends_with("-portal") {
            retval.portal_app_names.push(app_names[ii].as_str())
        } else {
            retval.core_app_names.push(app_names[ii].as_str())
        }
    }

    retval.core_app_names = retval.core_app_names.into_iter().unique().collect();
    retval.portal_app_names = retval.portal_app_names.into_iter().unique().collect();

    return Ok(retval);
}

pub fn change_path(new_path: &str) -> Result<(), Box<dyn Error>> {
    let my_fe_path = Path::new(new_path);
    // assert!(env::set_current_dir(&my_fe_path).is_ok(), "Path not found!");

    match my_fe_path.is_dir() {
        true => {
            info!(
                "Successfully changed working directory to {}",
                my_fe_path.display()
            );
            return Ok(());
        }
        false => {
            error!("Supplied path is not a directory");
            return Err("Supplied path is not a directory".into());
        } // Ok(res) => {
          //     info!(
          //         "Successfully changed working directory to {}",
          //         my_fe_path.display()
          //     );
          //     return Ok(());
          // }
          // Err(err) => {
          //     error!("Supplied path is not a directory");
          // }
    }
}

pub fn filter_application_from_angular_json(
    app_names: &Vec<String>,
    angular_json_value: &Value,
) -> Result<Vec<String>, Box<dyn Error>> {
    let mut retval = Vec::new();
    for ii in 0..app_names.len() {
        let app_name = app_names[ii].as_str();

        if angular_json_value["projects"][app_name] == json!(null) {
            return Err(format!(
                "invalid angular.json! {} is missing from your angular.json",
                app_name
            )
            .into());
        } else {
            if angular_json_value["projects"][app_name]["projectType"] == json!("application") {
                retval.push(app_name.to_string());
            }
        }
    }
    Ok(retval)
}

pub fn filter_application_from_project_json(
    internal_fe_path: &Path,
    app_names: &Vec<String>,
) -> Result<Vec<String>, Box<dyn Error>> {
    let mut retval = Vec::new();
    for ii in 0..app_names.len() {
        let app_name = app_names[ii].as_str();
        let app_path = internal_fe_path.join(format!("apps/{}", app_name));
        match app_path.is_dir() {
            true => {
                let project_json_path = &app_path.join("project.json");
                let project_json_file = File::open(project_json_path)?;
                let project_json_reader = BufReader::new(project_json_file);
                let project_json_content: Value = serde_json::from_reader(project_json_reader)?;
                if project_json_content["projectType"] == json!("application") {
                    retval.push(app_name.to_string());
                }
            }
            false => {
                return Err(format!(
                    "App path for {} not found. Looked in {}",
                    app_name,
                    app_path.display()
                )
                .into());
            }
        }
    }
    Ok(retval)
}
