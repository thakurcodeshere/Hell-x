#!/usr/bin/env node
/**
 * Hell-x CLI Binary Entrypoint
 */

import { createCli } from "../src/cli/index.js";

createCli().parse(process.argv);
