use log::{error, info, warn};

extern crate fs_extra;
use std::{
    env,
    error::Error,
    fs,
    path::{Path, PathBuf},
};

use fs_extra::dir::*;

pub fn check_path_exists(path: &PathBuf) -> bool {
    return Path::new(path).exists();
}

fn execute_delete_dir(server_dir: &str, app_name: &str) -> Result<(), Box<dyn Error>> {
    info!("Deleting existing app {} in server directory", app_name);
    if Path::new(server_dir).join(app_name).is_dir() {
        let _delete_result = fs::remove_dir_all(Path::new(server_dir).join(app_name))?;

        info!(
            "Done deleting existing app {} in server directory",
            app_name
        );
        Ok(())
    } else {
        warn!("No existing app {} in server directory", app_name);
        Ok(())
    }
}

fn execute_move_dir(my_fe_dist_app_path: &PathBuf, server_dir: &str) -> Result<(), Box<dyn Error>> {
    info!(
        "Moving built app from {} to server directory {}",
        my_fe_dist_app_path.display(),
        server_dir
    );

    if Path::new(my_fe_dist_app_path).exists() {
        let options = CopyOptions {
            ..Default::default()
        };
        let _result_move = fs_extra::dir::move_dir(my_fe_dist_app_path, server_dir, &options)?;

        info!(
            "Done moving built app from {} to server directory {}",
            my_fe_dist_app_path.display(),
            server_dir
        );
        Ok(())
    } else {
        error!(
            "{} not found! Please check your angular build log for more details",
            my_fe_dist_app_path.display()
        );
        return Err(format!(
            "{} not found! Please check your angular build log for more details",
            my_fe_dist_app_path.display(),
        )
        .into());
    }
}

pub fn move_app_dir_to_server_dir(
    fe_path: &str,
    app_dir: &str,
    server_dir: &str,
    app_name: &str,
    is_nx: &bool,
) -> Result<(), Box<dyn Error>> {
    let my_fe_path = Path::new(fe_path);
    let my_fe_dist_path = &my_fe_path.join(app_dir);
    let my_fe_dist_nx_path = if is_nx.to_owned() == true {
        my_fe_dist_path.clone().join("apps")
    } else {
        my_fe_dist_path.clone()
    };
    let my_fe_dist_app_path;
    let mut default_app_name = String::new().to_owned();

    if app_name.is_empty() {
        if cfg!(target_os = "windows") {
            let temp_app_name = fe_path.split('\\');
            default_app_name.push_str(&temp_app_name.last().unwrap().to_string());
        } else {
            let temp_app_name = fe_path.split('/');
            default_app_name.push_str(&temp_app_name.last().unwrap().to_string());
        }
    } else {
        default_app_name.push_str(app_name);
    }

    match env::set_current_dir(&my_fe_dist_nx_path).is_ok() {
        true => {
            info!("Angular build dir found {}", my_fe_dist_nx_path.display());
        }
        false => {
            error!("<frontendpath>/dist path not found!");
            return Err("<frontendpath>/dist path not found!".into());
        }
    }

    my_fe_dist_app_path = my_fe_dist_nx_path.join(&default_app_name);
    execute_delete_dir(server_dir, &default_app_name)?;
    execute_move_dir(&my_fe_dist_app_path, server_dir)?;
    Ok(())
}

pub fn open_config_file() -> Result<Option<PathBuf>, Box<dyn Error>> {
    let dirs_home_dir = dirs::home_dir();
    if let Some(home_path) = dirs_home_dir {
        let path = Path::new(&home_path);
        let config_path = path
            .join("Documents")
            .join("angular-deploy-gui")
            .join("config.adgc");
        if check_path_exists(&config_path) {
            return Ok(Some(config_path));
        } else {
            return Ok(None);
        }
    } else {
        return Err("Home dir not set! Cannot access config file".into());
    }
}
