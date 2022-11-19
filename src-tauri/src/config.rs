use std::{
    error::Error,
    path::{Path, PathBuf},
};

use crate::structs::config_struct::{AppSelectionConfigStruct, ConfigFileDataStruct};

use savefile::prelude::*;

pub fn save_selected_app_to_config(
    config_path: &Path,
    app_selection: &Vec<String>,
    fe_path: &String,
) -> Result<(), Box<dyn Error>> {
    let mut config_data: ConfigFileDataStruct = load_file(config_path, 0)?;
    if config_data.app_selection.len() > 0 {
        let mut config_data_app_selection_filtered_with_fe_path = config_data
            .app_selection
            .iter_mut()
            .find(|x| x.app_fe_path == fe_path.to_string());

        match config_data_app_selection_filtered_with_fe_path {
            Some(data) => {
                data.app_names = app_selection.to_vec();
                config_data_app_selection_filtered_with_fe_path = Some(data);
            }
            None => {
                let new_value = AppSelectionConfigStruct {
                    app_fe_path: fe_path.to_string(),
                    app_names: app_selection.to_vec(),
                };
                &config_data.app_selection.push(new_value);
            }
        }
    } else {
        let new_value = AppSelectionConfigStruct {
            app_fe_path: fe_path.to_string(),
            app_names: app_selection.to_vec(),
        };
        config_data.app_selection.push(new_value);
    }
    save_file(config_path, 0, &config_data)?;
    Ok(())
}

pub fn create_config_file() -> Result<PathBuf, Box<dyn Error>> {
    let data = ConfigFileDataStruct {
        fe_path: None,
        deploy_path: None,
        app_selection: vec![],
    };

    let dirs_home_dir = dirs::home_dir();
    if let Some(home_path) = dirs_home_dir {
        let path = Path::new(&home_path);
        let config_path = path
            .join("Documents")
            .join("angular-deploy-gui")
            .join("config.adgc");

        save_file(&config_path, 0, &data)?;
        Ok(config_path)
    } else {
        return Err("Home dir not set! Cannot access config file".into());
    }
}

pub fn load_selected_app_from_config(
    config_path: &PathBuf,
    fe_path: &String,
) -> Result<Option<AppSelectionConfigStruct>, Box<dyn Error>> {
    let data: ConfigFileDataStruct = load_file(&config_path, 0)?;
    let app_selection_for_fe_path_data = data
        .app_selection
        .into_iter()
        .find(|x| x.app_fe_path == fe_path.to_string());
    Ok(app_selection_for_fe_path_data)
}
