import chalk from 'chalk';
import * as readline from 'readline';
import { loadConfig, maskKey } from './config';
import { GateIOClient } from './gateio';

function printBanner(): void {
  console.clear();
  console.log(chalk.cyan('\n╔════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.yellow('     🚀 DTrader v3.0           ') + chalk.cyan('║'));
  console.log(chalk.cyan('╚════════════════════════════════════╝\n'));
}

async function promptMode(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    let countdown = 10;
    let timer: NodeJS.Timeout;

    console.log('Select Mode:\n');
    console.log(chalk.cyan('[1]') + ' 🛠️  Development ' + chalk.gray('(production read-only)'));
    console.log(chalk.yellow('[2]') + ' 🧪 Test ' + chalk.gray('(testnet)'));
    console.log('');

    const update = (): void => {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(chalk.white(`Choice (1-2) [${countdown}s]: `));
    };

    update();
    timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        rl.close();
        console.log(chalk.cyan('\n\n⏱️  Auto: Development (production read-only)\n'));
        resolve('1');
      } else {
        update();
      }
    }, 1000);

    rl.on('line', (answer) => {
      clearInterval(timer);
      rl.close();
      console.log('');
      resolve(answer.trim());
    });
  });
}

async function launch(useProduction: boolean): Promise<void> {
  process.env.APP_MODE = useProduction ? 'production' : 'test';
  const config = loadConfig();
  
  console.log(chalk.green(`✓ Mode: ${config.mode}`));
  console.log(chalk.gray(`  API: ${maskKey(config.apiKey)}`));
  console.log(chalk.gray(`  URL: ${config.apiUrl}\n`));
  
  if (useProduction) {
    console.log(chalk.red('⚠️  Using PRODUCTION keys (read-only mode)\n'));
  }
  
  const client = new GateIOClient(config.apiUrl, config.apiKey, config.apiSecret);
  
  console.log(chalk.blue('→ Testing connection...'));
  
  try {
    const balance = await client.getBalance();
    console.log(chalk.green('✓ Connected to Gate.io!\n'));
    
    console.log(chalk.bold('💰 Balance:'));
    console.log(chalk.gray('  Total:      ') + chalk.yellow(balance.total || '0') + ' USDT');
    console.log(chalk.gray('  Available:  ') + chalk.green(balance.available || '0') + ' USDT');
    console.log(chalk.gray('  In orders:  ') + chalk.cyan(balance.order_margin || '0') + ' USDT\n');
    
  } catch (error: any) {
    console.log(chalk.red('✗ Connection failed!\n'));
    console.log(chalk.red('Error: ') + chalk.gray(error.message));
    
    if (error.response) {
      console.log(chalk.red('Status: ') + chalk.gray(error.response.status));
      console.log(chalk.red('Data: ') + chalk.gray(JSON.stringify(error.response.data, null, 2)));
    }
    console.log('');
  }
}

async function main(): Promise<void> {
  try {
    printBanner();
    const choice = await promptMode();
    
    await launch(choice === '1');
    
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n👋 Bye!\n'));
      process.exit(0);
    });
    
  } catch (error) {
    console.error(chalk.red('\n✗ Error:'), error);
    process.exit(1);
  }
}

main();
