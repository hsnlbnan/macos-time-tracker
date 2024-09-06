#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use tauri::{CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tauri::PhysicalPosition;
use std::fs;
use tauri::ActivationPolicy;

#[tauri::command]
fn save_data(data: String) -> Result<(), String> {
    let app_dir = tauri::api::path::app_config_dir(&tauri::Config::default()).unwrap();
    let file_path = app_dir.join("todo_data.json");
    fs::write(file_path, data).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_data() -> Result<String, String> {
    let app_dir = tauri::api::path::app_config_dir(&tauri::Config::default()).unwrap();
    let file_path = app_dir.join("todo_data.json");
    fs::read_to_string(file_path).map_err(|e| e.to_string())
}

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Çıkış");
    let tray_menu = SystemTrayMenu::new()
        .add_item(quit);

    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .system_tray(SystemTray::new().with_menu(tray_menu))
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position,
                size,
                ..
            } => {
                let window = app.get_window("main").unwrap();
                if !window.is_visible().unwrap() {
                    let tray_position = position;
                    let tray_size = size;

                    let window_size = window.outer_size().unwrap();

                    let x = tray_position.x + (tray_size.width as f64 / 2.0) - (window_size.width as f64 / 2.0);
                    let y = tray_position.y + (tray_size.height as f64 / 2.0) - (window_size.height as f64 / 2.0);

                    window.set_position(PhysicalPosition::new(x as i32, y as i32)).unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                } else {
                    window.hide().unwrap();
                }
            }
            SystemTrayEvent::RightClick {
                position: _,
                size: _,
                ..
            } => {
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::Focused(is_focused) => {
                if !is_focused {
                    event.window().hide().unwrap();
                }
            }
            _ => {}
        })
        .setup(|app| {
            let app_dir = tauri::api::path::app_config_dir(&app.config()).unwrap();
            fs::create_dir_all(app_dir).unwrap();

            #[cfg(target_os = "macos")]
            app.set_activation_policy(ActivationPolicy::Accessory);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![save_data, load_data])
        .run(tauri::generate_context!())
        .expect("Tauri uygulaması başlatılırken hata oluştu");
}
