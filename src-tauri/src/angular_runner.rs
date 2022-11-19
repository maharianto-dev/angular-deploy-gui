use std::{error::Error, path::Path};

use log::{error, info};
use tauri::api::process::{Command, Output};

use crate::{directory, enums::AppKind};

pub fn build_and_deploy(
    app_names: Vec<&str>,
    command_to_run_p: &str,
    use_nx: bool,
    is_skip_nx_cache: bool,
    fe_path: &str,
    deploy_path: Option<String>,
    kind: AppKind,
    is_nx_dir: bool,
) -> Result<(), Box<dyn Error>> {
    let mut command_to_run = command_to_run_p.to_string();
    if app_names.len() > 1 || use_nx == true {
        if app_names.len() > 1 {
            command_to_run.push_str(&format!(
                "nx run-many --target=build --projects={} --parallel={}",
                app_names.join(","),
                app_names.len()
            ));
        } else {
            command_to_run.push_str(&format!("nx b {}", app_names[0]));
        }
    } else {
        command_to_run.push_str(&format!("ng b {}", app_names[0]));
    }

    if is_skip_nx_cache == true {
        command_to_run.push_str(&format!(" --skip-nx-cache"));
    }

    if kind == AppKind::Portal {
        command_to_run.push_str(&format!(" --configuration=portal"));
    }

    info!("Running command: {}", command_to_run);

    // helpers::change_path(fe_path)?;
    run_ng_command(&command_to_run, fe_path)?;

    if let Some(deploypath) = deploy_path.as_deref() {
        if app_names.len() > 1 {
            for ii in 0..app_names.len() {
                directory::move_app_dir_to_server_dir(
                    fe_path,
                    "dist",
                    deploypath,
                    app_names[ii],
                    &is_nx_dir,
                )?;
            }
        } else {
            directory::move_app_dir_to_server_dir(
                fe_path,
                "dist",
                deploypath,
                app_names[0],
                &is_nx_dir,
            )?;
        }
    } else {
        info!("Automatic deployment did not run, deploypath flag not specified!");
    }
    Ok(())
}

fn run_ng_command(my_command: &str, fe_path: &str) -> Result<(), Box<dyn Error>> {
    let cmd;
    if cfg!(target_os = "windows") {
        cmd = Command::new(format!("cmd"));
        let output = cmd
            .args(vec!["/C", my_command])
            .current_dir(Path::new(fe_path).to_path_buf())
            .output()?;
        handle_run_ng_command_output(output)?;
    } else {
        cmd = Command::new(format!("sh"));
        let output = cmd
            .args(vec!["-c", my_command])
            .current_dir(Path::new(fe_path).to_path_buf())
            .output()?;
        handle_run_ng_command_output(output)?;
    };
    Ok(())

    // let mut cmd;
    // if cfg!(target_os = "windows") {
    //     cmd = Command::new(format!("cmd"));
    //     cmd.arg("/C");
    // } else {
    //     cmd = Command::new(format!("sh"));
    //     cmd.arg("-c");
    // };
    // cmd.arg(my_command);
    // let child = cmd.spawn()?;

    // child.wait_with_output()?;
    // Ok(())
}

fn handle_run_ng_command_output(output: Output) -> Result<(), Box<dyn Error>> {
    match output.status.code() {
        Some(status_result_code) => {
            if status_result_code == 0 {
                let split_stdout: Vec<&str> = output.stdout.as_str().split("\\n").collect();

                for ii in 0..split_stdout.len() {
                    info!("{}", split_stdout[ii]);
                }
                Ok(())
            } else {
                let split_stderr: Vec<&str> = output.stderr.as_str().split("\\n").collect();
                for ii in 0..split_stderr.len() {
                    info!("{}", split_stderr[ii]);
                }
                return Err(format!("{:?}", output.stderr)
                    .replace("\\r", "")
                    .replace("\"", "")
                    .into());
            }
        }
        None => {
            error!("Angular build command returns no status!");
            return Err("Angular build command returns no status!".into());
        }
    }
}
