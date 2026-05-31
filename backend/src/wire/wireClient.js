import { env } from '../config/env.js';
import { sleep, withTimeout } from '../utils/async.js';
import { AppError } from '../utils/http.js';

const TERMINAL_SUCCESS = new Set(['completed', 'complete', 'success', 'succeeded', 'done']);
const TERMINAL_FAILURE = new Set(['failed', 'error', 'cancelled', 'canceled']);

export class WireClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey ?? env.wire.apiKey;
    this.baseUrl = (options.baseUrl ?? env.wire.baseUrl).replace(/\/$/, '');
    this.pollIntervalMs = options.pollIntervalMs ?? env.wire.pollIntervalMs;
    this.timeoutMs = options.timeoutMs ?? env.wire.timeoutMs;
    this.maxRetries = options.maxRetries ?? env.wire.maxRetries;
  }

  async runAction(actionId, params = {}, options = {}) {
    if (!this.apiKey) {
      throw new AppError('ANAKIN_WIRE_API_KEY is required for real Wire searches.', 500);
    }

    return withTimeout(
      this.#runWithRetries(actionId, params),
      options.timeoutMs || this.timeoutMs,
      `Wire action ${actionId}`
    );
  }

  async #runWithRetries(actionId, params) {
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      try {
        const task = await this.#createTask(actionId, params);
        console.log("ACTION:", actionId);
        console.log("TASK:", task);
        const jobId = task.job_id || task.jobId || task.id;

        if (!jobId) {
          throw new Error('Wire task response did not include a job id.');
        }

        return await this.#pollJob(jobId);
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries) {
          await sleep(400 * (attempt + 1));
        }
      }
    }

    throw lastError;
  }

  async #createTask(actionId, params) {
    const response = await fetch(`${this.baseUrl}/task`, {
      method: 'POST',
      headers: this.#headers(),
      body: JSON.stringify({
        action_id: actionId,
        params
      })
    });

    return this.#readJson(response, `Failed to create Wire task for ${actionId}`);
  }

  async #pollJob(jobId) {
    
    const startedAt = Date.now();

    while (Date.now() - startedAt < this.timeoutMs) {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        method: 'GET',
        headers: this.#headers(false)
      });
      const job = await this.#readJson(response, `Failed to poll Wire job ${jobId}`);
      console.log("FULL JOB RESPONSE:");
      console.dir(job, { depth: null });
      const status = String(job.status || job.state || '').toLowerCase();

      if (TERMINAL_SUCCESS.has(status)) {
        return job.result || job.output || job.data || job;
      }

      if (TERMINAL_FAILURE.has(status)) {
        throw new Error(job.error?.message || job.message || `Wire job ${jobId} failed.`);
      }

      await sleep(this.pollIntervalMs);
    }

    throw new Error(`Wire job ${jobId} timed out.`);
  }

  #headers(hasBody = true) {
    return {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      Accept: 'application/json',
      'X-API-Key': this.apiKey
    };
  }

  async #readJson(response, fallbackMessage) {
    const text = await response.text();
    let json = null;

    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }

    if (!response.ok) {
      throw new Error(json?.error?.message || json?.message || fallbackMessage);
    }

    return json;
  }
}

export const wireClient = new WireClient();

