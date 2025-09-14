import nodemailer from 'nodemailer';
import config from '../src/config';

/**
 * Script para testar configurações de email
 * Valida e testa o envio de emails com as configurações atuais
 */

class EmailTester {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });
  }

  // Verificar configuração de email
  async verifyConfiguration(): Promise<boolean> {
    try {
      console.log('🔍 Verificando configuração de email...');
      
      const verification = await this.transporter.verify();
      console.log('✅ Configuração de email válida!');
      return verification;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro na configuração de email:', message);
      return false;
    }
  }

  // Enviar email de teste
  async sendTestEmail(to: string = config.email.user || ''): Promise<boolean> {
    try {
      console.log(`📧 Enviando email de teste para: ${to}`);
      
      const testEmailOptions = {
        from: {
          name: 'Sistema Brimu',
          address: config.email.user || ''
        },
        to: to,
        subject: '🌳 Teste de Configuração - Sistema Brimu',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🌳 Sistema Brimu</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Teste de Configuração de Email</p>
            </div>
            
            <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #22C55E; margin-top: 0;">✅ Email Funcionando!</h2>
              
              <p>Se você está lendo esta mensagem, significa que a configuração de email do sistema Brimu está funcionando corretamente.</p>
              
              <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; border-left: 4px solid #22C55E; margin: 20px 0;">
                <h3 style="color: #16A34A; margin-top: 0;">📊 Informações do Teste:</h3>
                <ul style="color: #374151; line-height: 1.6;">
                  <li><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                  <li><strong>Servidor:</strong> ${config.email.host}:${config.email.port}</li>
                  <li><strong>Remetente:</strong> ${config.email.user}</li>
                  <li><strong>Status:</strong> Configuração válida</li>
                </ul>
              </div>
              
              <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
                <h3 style="color: #D97706; margin-top: 0;">⚠️ Próximos Passos:</h3>
                <ol style="color: #374151; line-height: 1.6;">
                  <li>Configure um endereço de email profissional (ex: noreply@suaempresa.com)</li>
                  <li>Ative a autenticação de 2 fatores no Gmail (se usando Gmail)</li>
                  <li>Gere uma "Senha de App" específica para o sistema</li>
                  <li>Teste o envio para clientes reais</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #6B7280; font-size: 14px;">
                  Este email foi gerado automaticamente pelo sistema de testes do Brimu.<br>
                  Não é necessário responder esta mensagem.
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
🌳 SISTEMA BRIMU - TESTE DE EMAIL

✅ EMAIL FUNCIONANDO!

Se você está lendo esta mensagem, a configuração de email está correta.

📊 INFORMAÇÕES DO TESTE:
- Data/Hora: ${new Date().toLocaleString('pt-BR')}
- Servidor: ${config.email.host}:${config.email.port}
- Remetente: ${config.email.user}
- Status: Configuração válida

⚠️ PRÓXIMOS PASSOS:
1. Configure um endereço de email profissional
2. Ative a autenticação de 2 fatores no Gmail
3. Gere uma "Senha de App" específica
4. Teste com clientes reais

Este email foi gerado automaticamente pelo sistema de testes.
        `
      };

      const result = await this.transporter.sendMail(testEmailOptions);
      console.log('✅ Email de teste enviado com sucesso!');
      console.log(`📧 ID da mensagem: ${result.messageId}`);
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro ao enviar email de teste:', message);
      return false;
    }
  }

  // Executar todos os testes
  async runAllTests(): Promise<void> {
    console.log('🧪 Iniciando testes de email...\n');

    // Verificar configuração
    const configValid = await this.verifyConfiguration();
    if (!configValid) {
      console.log('\n💡 DICAS PARA CONFIGURAR EMAIL:');
      console.log('1. Gmail: Use senha de app (não a senha normal)');
      console.log('2. Ative autenticação de 2 fatores');
      console.log('3. Vá em: Conta Google > Segurança > Senhas de app');
      console.log('4. Gere uma senha específica para "Mail"');
      console.log('5. Use essa senha no EMAIL_PASS do .env');
      return;
    }

    console.log('');

    // Enviar email de teste
    const emailSent = await this.sendTestEmail();
    
    console.log('\n🎉 TESTES CONCLUÍDOS!');
    
    if (emailSent) {
      console.log('✅ Sistema de email está funcionando perfeitamente');
      console.log('📬 Verifique sua caixa de entrada');
    } else {
      console.log('❌ Problemas detectados no envio de email');
    }
  }

  // Testar diferentes configurações
  async testAlternativeConfigs(): Promise<void> {
    console.log('🔧 Testando configurações alternativas...\n');

    const configs = [
      { name: 'Gmail', host: 'smtp.gmail.com', port: 587 },
      { name: 'Gmail SSL', host: 'smtp.gmail.com', port: 465 },
      { name: 'Outlook', host: 'smtp-mail.outlook.com', port: 587 },
      { name: 'Yahoo', host: 'smtp.mail.yahoo.com', port: 587 }
    ];

    for (const testConfig of configs) {
      try {
        console.log(`🧪 Testando: ${testConfig.name} (${testConfig.host}:${testConfig.port})`);
        
        const testTransporter = nodemailer.createTransport({
          host: testConfig.host,
          port: testConfig.port,
          secure: testConfig.port === 465,
          auth: {
            user: config.email.user,
            pass: config.email.pass
          }
        });

        await testTransporter.verify();
        console.log(`✅ ${testConfig.name}: Funcionando`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(`❌ ${testConfig.name}: Falhou (${message})`);
      }
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const tester = new EmailTester();
  
  // Verificar argumentos de linha de comando
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'verify':
      tester.verifyConfiguration();
      break;
    case 'send':
      const email = args[1] || config.email.user;
      if (email) {
        tester.sendTestEmail(email);
      } else {
        console.error('Email de destino não configurado.');
      }
      break;
    case 'alternatives':
      tester.testAlternativeConfigs();
      break;
    default:
      tester.runAllTests();
  }
}

export default EmailTester;
