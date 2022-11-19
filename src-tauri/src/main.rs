#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{env, path::Path};

use enums::{AppKind, NoDataOrWithDataStruct};
use log::{error, info, warn, LevelFilter};
use log4rs::append::file::FileAppender;
use log4rs::config::{Appender, Config, Root};
use log4rs::encode::pattern::PatternEncoder;
use serde_json::json;
use structs::commands_struct::SaveAppSelectionCommandStruct;
use structs::config_struct::AppSelectionConfigStruct;
use structs::{
    commands_struct::{RunCommandStruct, SetPathCommandStruct},
    returns_struct::{CheckConfigFileReturnStruct, CommandResultStruct, SetPathResultReturnStruct},
};
mod angular_runner;
mod config;
mod directory;
mod enums;
mod helpers;
mod structs;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn init_config() -> CommandResultStruct<CheckConfigFileReturnStruct> {
    info!("### RUNNING INIT CONFIG ###");
    let dirs_home_dir = dirs::home_dir();
    if let Some(home_path) = dirs_home_dir {
        let path = Path::new(&home_path);
        let config_path = path
            .join("Documents")
            .join("angular-deploy-gui")
            .join("config.adgc");
        if directory::check_path_exists(&config_path) {
            let retval_data = CheckConfigFileReturnStruct {
                is_found: true,
                message: "Config file found! Loading data from config file!".to_string(),
            };
            let retval = CommandResultStruct {
                command_result: true,
                command_message: "".to_string(),
                command_data: Some(retval_data),
            };
            return retval;
        } else {
            let retval_data = CheckConfigFileReturnStruct {
                is_found: false,
                message: "Config file not found! Do you want to create a config file?".to_string(),
            };
            let retval = CommandResultStruct {
                command_result: true,
                command_message: "".to_string(),
                command_data: Some(retval_data),
            };
            return retval;
        }
    } else {
        let retval_data = CheckConfigFileReturnStruct {
            is_found: false,
            message: "Home dir not set! Continuing without config file".to_string(),
        };
        let retval = CommandResultStruct {
            command_result: false,
            command_message: "Home dir not set".to_string(),
            command_data: Some(retval_data),
        };
        return retval;
    }
}

#[tauri::command]
fn set_path(config: SetPathCommandStruct) -> NoDataOrWithDataStruct<SetPathResultReturnStruct> {
    info!("### RUNNING SET PATH ###");
    let mut retval = CommandResultStruct::initialize();
    let internal_fe_path = Path::new(&config.fe_path);
    if directory::check_path_exists(&internal_fe_path.to_path_buf()) {
        // let mut is_angular_dir;

        let is_angular_dir;
        let mut is_nx_dir = false;
        if directory::check_path_exists(&internal_fe_path.join("nx.json")) {
            // retval = CommandResultStruct::new(true, "Nx workspace!");
            is_angular_dir = true;
            is_nx_dir = true;
        } else if directory::check_path_exists(&internal_fe_path.join("angular.json")) {
            // retval = CommandResultStruct::new(true, "Angular non-nx workspace!");
            is_angular_dir = true;
            is_nx_dir = false;
        } else {
            retval =
                CommandResultStruct::new(false, "Path supplied is not an nx or angular workspace!");
            is_angular_dir = false;
        }

        if is_angular_dir {
            match helpers::get_angular_json_configs(&internal_fe_path.join("angular.json")) {
                Err(e) => {
                    let retval = CommandResultStruct::new(false, &format!("{}", e));
                    return NoDataOrWithDataStruct::NoData(retval);
                }
                Ok(result) => {
                    let angular_json_result = result.clone();
                    let project_list: Vec<String> = angular_json_result["projects"]
                        .as_object()
                        .unwrap()
                        .keys()
                        .cloned()
                        .collect();
                    let project_list_iter = project_list.into_iter();

                    let project_list_non_e2e: Vec<String> = project_list_iter
                        .filter(|x| !x.ends_with("-e2e"))
                        .collect::<Vec<String>>()
                        .try_into()
                        .unwrap();

                    if is_nx_dir {
                        // if true means conf is in root/angular.json not in root/apps/<app_name>/project.json
                        if angular_json_result["projects"][project_list_non_e2e[0].clone()]
                            ["projectType"]
                            != json!(null)
                        {
                            info!("reading config from angular.json");
                            match helpers::filter_application_from_angular_json(
                                &project_list_non_e2e,
                                &angular_json_result,
                            ) {
                                Ok(result) => {
                                    let data_for_retval = SetPathResultReturnStruct {
                                        is_nx_dir: is_nx_dir,
                                        json_value: result,
                                    };
                                    let retval_with_data = CommandResultStruct::new_with_generic(
                                        true,
                                        "angular.json read",
                                        data_for_retval,
                                    );
                                    return NoDataOrWithDataStruct::WithData(retval_with_data);
                                }
                                Err(err) => {
                                    error!("{:?}", err);
                                    let retval = CommandResultStruct::new(
                                        false,
                                        "Error getting config from angular.json",
                                    );
                                    return NoDataOrWithDataStruct::NoData(retval);
                                }
                            };
                        } else {
                            info!("reading config from per-app project.json");
                            match helpers::filter_application_from_project_json(
                                internal_fe_path,
                                &project_list_non_e2e,
                            ) {
                                Ok(result) => {
                                    let data_for_retval = SetPathResultReturnStruct {
                                        is_nx_dir: is_nx_dir,
                                        json_value: result,
                                    };
                                    let retval_with_data = CommandResultStruct::new_with_generic(
                                        true,
                                        "angular.json read",
                                        data_for_retval,
                                    );
                                    return NoDataOrWithDataStruct::WithData(retval_with_data);
                                }
                                Err(err) => {
                                    error!("{:?}", err);
                                    let retval = CommandResultStruct::new(
                                        false,
                                        "Error getting config from project.json",
                                    );
                                    return NoDataOrWithDataStruct::NoData(retval);
                                }
                            };
                        }
                    } else {
                        info!("reading config from angular.json");
                        match helpers::filter_application_from_angular_json(
                            &project_list_non_e2e,
                            &angular_json_result,
                        ) {
                            Ok(result) => {
                                let data_for_retval = SetPathResultReturnStruct {
                                    is_nx_dir: is_nx_dir,
                                    json_value: result,
                                };
                                let retval_with_data = CommandResultStruct::new_with_generic(
                                    true,
                                    "angular.json read",
                                    data_for_retval,
                                );
                                return NoDataOrWithDataStruct::WithData(retval_with_data);
                            }
                            Err(err) => {
                                error!("{:?}", err);
                                let retval = CommandResultStruct::new(
                                    false,
                                    "Error getting config from angular.json",
                                );
                                return NoDataOrWithDataStruct::NoData(retval);
                            }
                        };
                    }
                }
            };
        } else {
            return NoDataOrWithDataStruct::NoData(retval);
        }
    } else {
        retval = CommandResultStruct::new(false, "Frontend dir not found!");
    }

    return NoDataOrWithDataStruct::NoData(retval);
}

#[tauri::command]
fn run_angular_command(run_command: RunCommandStruct) -> CommandResultStruct<()> {
    info!("### RUNNING ANGULAR COMMAND ###");
    let fe_path = run_command.fe_path;
    let server_path = run_command.server_path;
    let selected_app = run_command.selected_app;
    let use_nx = run_command.use_nx;
    let skip_nx_cache = run_command.skip_nx_cache;
    let is_nx_dir = run_command.is_nx_dir;

    let app_names = match helpers::get_app_names(&selected_app) {
        Ok(res) => res,
        Err(err) => {
            error!("{:?}", err);
            let retval =
                CommandResultStruct::new(false, "Error getting list of selected app name(s)");
            return retval;
        }
    };

    let command_to_run = String::new().to_owned();

    if app_names.core_app_names.len() == 0 {
        warn!("Detected 0 (zero) core app in supplied argument, skipping core apps build and deployment");
    } else {
        info!("Starting core app(s) build and deployment");
        match angular_runner::build_and_deploy(
            app_names.core_app_names,
            &command_to_run,
            use_nx,
            skip_nx_cache,
            &fe_path,
            server_path.clone(),
            AppKind::Core,
            is_nx_dir,
        ) {
            Ok(_) => {
                info!("Done with core app(s) build and deployment");
            }
            Err(err) => {
                error!("{:?}", err);
                let retval =
                    CommandResultStruct::new(false, "Error building and deploying core app(s)");
                return retval;
            }
        };
    }

    if app_names.portal_app_names.len() == 0 {
        warn!("Detected 0 (zero) portal app in supplied argument, skipping portal apps build and deployment")
    } else {
        info!("Starting portal app(s) build and deployment");
        match angular_runner::build_and_deploy(
            app_names.portal_app_names,
            &command_to_run,
            use_nx,
            skip_nx_cache,
            &fe_path,
            server_path.clone(),
            AppKind::Portal,
            is_nx_dir,
        ) {
            Ok(_) => {
                info!("Done with portal app(s) build and deployment");
            }
            Err(err) => {
                error!("{:?}", err);
                let retval =
                    CommandResultStruct::new(false, "Error building and deploying portal app(s)");
                return retval;
            }
        };
    }

    info!("Graceful run angular command shutdown!");
    let retval = CommandResultStruct::new(true, "Done building and deploying selected app(s)");
    return retval;
}

#[tauri::command]
fn save_app_selection_config(
    save_app_command: SaveAppSelectionCommandStruct,
) -> CommandResultStruct<()> {
    info!("### RUNNING SAVE APP SELECTION CONFIG ###");
    info!("Opening config file to save");
    match directory::open_config_file() {
        Ok(result) => match result {
            // config file found
            Some(config_path) => {
                info!("Saving app selection to config file");
                match config::save_selected_app_to_config(
                    &config_path.as_path(),
                    &save_app_command.app_selection,
                    &save_app_command.fe_path,
                ) {
                    Ok(_) => {
                        info!(
                            "App selection saved succesfully for angular project in {}",
                            save_app_command.fe_path
                        )
                    }
                    Err(err) => {
                        error!("{:?}", err);
                        let retval = CommandResultStruct::new(
                            true,
                            "Error saving config to existing config file",
                        );
                        return retval;
                    }
                }
            }
            None => match config::create_config_file() {
                Ok(config_path) => {
                    match config::save_selected_app_to_config(
                        &config_path.as_path(),
                        &save_app_command.app_selection,
                        &save_app_command.fe_path,
                    ) {
                        Ok(_) => {}
                        Err(err) => {
                            error!("{:?}", err);
                            let retval = CommandResultStruct::new(
                                true,
                                "Error saving config to new config file",
                            );
                            return retval;
                        }
                    }
                }
                Err(err) => {
                    error!("{:?}", err);
                    let retval = CommandResultStruct::new(false, "Error creating config file");
                    return retval;
                }
            },
        },
        Err(err) => {
            error!("{:?}", err);
            let retval = CommandResultStruct::new(false, "Error opening config file");
            return retval;
        }
    };

    let retval = CommandResultStruct::new(true, "Config saved succesfully");
    return retval;
}

#[tauri::command]
fn load_app_selection_config(
    fe_path: String,
) -> NoDataOrWithDataStruct<Option<AppSelectionConfigStruct>> {
    info!("### RUNNING LOAD APP SELECTION CONFIG ###");
    info!("Opening config file to load");
    match directory::open_config_file() {
        Ok(result) => match result {
            Some(config_path) => {
                info!("Loading selected app from config");
                match config::load_selected_app_from_config(&config_path, &fe_path) {
                    Ok(result) => {
                        info!("Config file loaded");
                        let retval = CommandResultStruct::new_with_generic(
                            true,
                            "Config file loaded",
                            result,
                        );
                        return NoDataOrWithDataStruct::WithData(retval);
                    }
                    Err(err) => {
                        error!("{:?}", err);
                        let retval = CommandResultStruct::new(
                            false,
                            "Error reading app selection from config file",
                        );
                        return NoDataOrWithDataStruct::NoData(retval);
                    }
                }
            }
            None => {
                info!("Config file not found!");
                let retval = CommandResultStruct::new(false, "Config file not found");
                return NoDataOrWithDataStruct::NoData(retval);
            }
        },
        Err(err) => {
            error!("{:?}", err);
            let retval = CommandResultStruct::new(false, "Error opening config file");
            return NoDataOrWithDataStruct::NoData(retval);
        }
    }
}

fn main() {
    let dirs_home_dir = dirs::home_dir();
    if let Some(home_path) = dirs_home_dir {
        let file_path = "log/angular-deploy-gui.log";
        let my_home_path = Path::new(&home_path);
        let home_log_file_path = &my_home_path
            .join("Documents")
            .join("angular-deploy-gui")
            .join(file_path);
        // Logging to log file.
        let logfile = FileAppender::builder()
            // Pattern: https://docs.rs/log4rs/*/log4rs/encode/pattern/index.html
            .encoder(Box::new(PatternEncoder::new(
                "[{d(%Y-%m-%d %H:%M:%S)} - {l} - {M}] {m}\n",
            )))
            .build(home_log_file_path)
            .unwrap();

        // Log Trace level output to file where trace is the default level
        // and the programmatically specified level to stderr.
        let config = Config::builder()
            .appender(Appender::builder().build("logfile", Box::new(logfile)))
            // .appender(
            //     Appender::builder()
            //         .filter(Box::new(ThresholdFilter::new(level)))
            //         .build("stderr", Box::new(stderr)),
            // )
            .build(
                Root::builder()
                    .appender("logfile")
                    // .appender("stderr")
                    .build(LevelFilter::Trace),
            )
            .unwrap();

        // Use this to change log levels at runtime.
        // This means you can change the default log level to trace
        // if you are trying to debug an issue and need more logs on then turn it off
        // once you are done.
        let _handle = log4rs::init_config(config).unwrap();
    }

    info!("App Started!");

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            init_config,
            set_path,
            run_angular_command,
            save_app_selection_config,
            load_app_selection_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
