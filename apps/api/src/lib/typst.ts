import { spawn } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { readFile, rm } from 'fs/promises';
import { env } from './env';

export interface CompilarTypstOptions {
  inputs?: Record<string, string>;
  sourceDateEpoch?: number;
}

/**
 * Compila una plantilla Typst con argumentos estructurados a un buffer PDF en memoria.
 */
export async function compilarTypstPdf(
  rutaPlantilla: string,
  options?: CompilarTypstOptions,
): Promise<Buffer> {
  const tmpSalida = join(tmpdir(), `typst_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`);
  const typstBin = env.TYPST_BIN || 'typst';

  const args: string[] = ['compile'];

  if (options?.inputs) {
    for (const [clave, valor] of Object.entries(options.inputs)) {
      args.push('--input', `${clave}=${valor}`);
    }
  }

  args.push(rutaPlantilla, tmpSalida);

  const envVariables = {
    ...process.env,
    SOURCE_DATE_EPOCH: options?.sourceDateEpoch ? String(options.sourceDateEpoch) : '1735689600',
  };

  return new Promise((resolve, reject) => {
    const proc = spawn(typstBin, args, { env: envVariables });

    let stderr = '';
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', async (code) => {
      if (code !== 0) {
        await rm(tmpSalida, { force: true }).catch(() => {});
        return reject(new Error(`Typst falló con código ${code}: ${stderr}`));
      }

      try {
        const buffer = await readFile(tmpSalida);
        await rm(tmpSalida, { force: true }).catch(() => {});
        resolve(buffer);
      } catch (err) {
        reject(err);
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`No se pudo ejecutar typst (${typstBin}): ${err.message}`));
    });
  });
}
