//! Choreo (_Constraint-Honoring Omnidirectional Route Editor and Optimizer_,
//! pronounced like choreography) is a graphical tool for planning
//! time-optimized trajectories for autonomous mobile robots in the FIRST
//! Robotics Competition.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
mod built;
mod logging;
mod tauri;

use std::fs;

use choreo_core::generation::remote::{RemoteArgs, remote_generate_child};

fn main() {
    // On Windows the default console code page is CP1252. Sleipnir's solver
    // prints UTF-8 special characters (∞, α, etc.) via C printf, which leaves
    // bytes in the console buffer that Rust's stdout wrapper then rejects as
    // non-UTF-8, causing a panic. Setting CP_UTF8 (65001) fixes this.
    #[cfg(windows)]
    {
        unsafe extern "system" {
            fn SetConsoleOutputCP(wCodePageID: u32) -> i32;
        }
        unsafe { SetConsoleOutputCP(65001) };
    }
    let args = std::env::args().collect::<Vec<_>>();
    if args.len() > 2 {
        panic!("Unsupoorted arguments: {args:?}");
    }

    if let Some(arg) = args.get(1) {
        if let Ok(remote_args) = RemoteArgs::from_content(arg) {
            tracing_subscriber::fmt()
                .with_max_level(tracing::Level::ERROR)
                .event_format(logging::CompactFormatter { ansicolor: false })
                .init();
            remote_generate_child(remote_args);
        } else {
            match fs::canonicalize(arg) {
                Ok(path) => {
                    tauri::run_tauri(Some(path));
                }
                Err(e) => {
                    panic!("Failed to canonicalize {arg} : {e:?}");
                }
            }
        }
    } else {
        tauri::run_tauri(None);
    }
}
