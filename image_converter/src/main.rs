use clap::Parser;
use std::path::Path;
use std::{fs, path::PathBuf};
use webp::{Encoder, WebPMemory};

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    #[arg(short, long)]
    input: String,

    #[arg(short, long)]
    output: String,

    #[arg(short, long, default_value = None)]
    count_skip: Option<i32>,
}

fn main() {
    let args = Args::parse();

    let image_dirs = fs::read_dir(&args.input).expect("Invalid input arg");
    let out_dir = Path::new(&args.output);

    let mut total_saved: f32 = 0.0;
    for (index, dir) in image_dirs.into_iter().enumerate() {
        let dir = dir.expect("Failed to unwrap sub-dir");

        let in_images = fs::read_dir(dir.path()).expect("Failed to read sub-dir");

        for image in in_images {
            let image = image.unwrap();

            let out_dir = out_dir.join((index + args.count_skip.unwrap_or(0) as usize).to_string());
            let out_file = out_dir
                .clone()
                .join(image.path().file_stem().unwrap())
                .with_extension("webp");

            convert(&image.path(), &out_dir, &out_file);

            let saved = size_diff(&image.path(), &out_file);
            total_saved += saved;
            println!(
                "Converted: {:?} to webp, Saved {:.3}kb",
                image.path(),
                saved
            );
        }
    }

    println!("Finished, Saved {:.3}mb in total", total_saved * 0.001);
}

fn convert(image_path: &Path, out_dir: &PathBuf, out_file: &Path) {
    let old_img = image::open(image_path).expect("Failed to read image");

    let encoder: Encoder = Encoder::from_image(&old_img).expect("Failed to create encoder");

    let webp: WebPMemory = encoder.encode(90f32);

    fs::create_dir_all(&out_dir).unwrap();

    fs::write(&out_file, &*webp).unwrap();
}

type KB = f32;
fn size_diff(old: &Path, new: &Path) -> KB {
    let old_size = old.metadata().unwrap().len();
    let new_size = new.metadata().unwrap().len();

    let diff = old_size - new_size;

    diff as f32 * 0.001
}
