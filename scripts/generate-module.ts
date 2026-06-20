import * as fs from 'fs/promises';
import * as path from 'path';
import * as readline from 'readline/promises';


function pascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function paramCase(str: string): string {
  return str.toLowerCase().replace(/\s/g, '-');
}

// ------------------------------------------------------------
// 1. Interface com o usuário
// ------------------------------------------------------------
async function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

// ------------------------------------------------------------
// 2. Funções auxiliares para criação de diretórios e arquivos
// ------------------------------------------------------------
async function writeFileIfNotExists(filePath: string, content: string): Promise<void> {
  try {
    await fs.access(filePath);
    console.log(`⏩ Arquivo já existe: ${filePath}`);
  } catch {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✅ Criado: ${filePath}`);
  }
}

// ------------------------------------------------------------
// 3. Templates de arquivos (usam placeholders)
// ------------------------------------------------------------
function getTemplates(singular: string) {
  const plural = singular + 's';
  const pascalSingular = pascalCase(singular);
  const camelSingular = camelCase(singular);
  const kebabSingular = paramCase(singular);
  const pascalPlural = pascalCase(plural);
  const camelPlural = camelCase(plural);
  const kebabPlural = paramCase(plural);

  const files = [
    // Module principal
    {
      path: `${plural}.module.ts`,
      content: `import { Module } from '@nestjs/common';
import { ${pascalPlural}Controller } from './infra/http/controllers/${plural}.controller';
import { Prisma${pascalPlural}Repository } from './infra/database/prisma/repositories/prisma-${singular}.repositorie';
import { ${pascalSingular}Repository } from './domain/repositories/${singular}.repositorie';
import { Create${pascalSingular}UseCase } from './application/use-cases/create-${singular}.use-case';
import { Find${pascalPlural}UseCase } from './application/use-cases/find-${plural}.use-case';
import { Update${pascalSingular}UseCase } from './application/use-cases/update-${singular}.use-case';
import { Delete${pascalSingular}UseCase } from './application/use-cases/delete-${singular}.use-case';

@Module({
  controllers: [${pascalPlural}Controller],
  providers: [
    Create${pascalSingular}UseCase,
    Find${pascalPlural}UseCase,
    Update${pascalSingular}UseCase,
    Delete${pascalSingular}UseCase,
    {
      provide: ${pascalSingular}Repository,
      useClass: Prisma${pascalPlural}Repository,
    },
  ],
  exports: [],
})
export class ${pascalPlural}Module {}`,
    },

    // Domain - Entities
    {
      path: `domain/entities/${singular}.entitie.ts`,
      content: `export class ${pascalSingular} {
  // TODO: definir propriedades
}`,
    },

    // Domain - Repositories (abstrato)
    {
      path: `domain/repositories/${singular}.repositorie.ts`,
      content: `import { ${pascalSingular} } from '../entities/${singular}.entitie';

export abstract class ${pascalSingular}Repository {
  abstract create(data: any): Promise<${pascalSingular}>;
  abstract findAll(): Promise<${pascalSingular}[]>;
  abstract findById(id: string): Promise<${pascalSingular} | null>;
  abstract update(id: string, data: any): Promise<${pascalSingular}>;
  abstract delete(id: string): Promise<void>;
}`,
    },

    // Domain - @types (opcional)
    {
      path: `domain/@types/${singular}.ts`,
      content: `// Tipos específicos do domínio para ${pascalSingular}`,
    },

    // Application - Use Cases
    {
      path: `application/use-cases/create-${singular}.use-case.ts`,
      content: `import { Injectable } from '@nestjs/common';
import { ${pascalSingular}Repository } from '../../domain/repositories/${singular}.repositorie';
import { ${pascalSingular} } from '../../domain/entities/${singular}.entitie';

@Injectable()
export class Create${pascalSingular}UseCase {
  constructor(private readonly ${camelSingular}Repository: ${pascalSingular}Repository) {}

  async execute(input: any): Promise<${pascalSingular}> {
    // TODO: implementar
    throw new Error('Method not implemented.');
  }
}`,
    },
    {
      path: `application/use-cases/find-${plural}.use-case.ts`,
      content: `import { Injectable } from '@nestjs/common';
import { ${pascalSingular}Repository } from '../../domain/repositories/${singular}.repositorie';
import { ${pascalSingular} } from '../../domain/entities/${singular}.entitie';

@Injectable()
export class Find${pascalPlural}UseCase {
  constructor(private readonly ${camelSingular}Repository: ${pascalSingular}Repository) {}

  async execute(query: any): Promise<${pascalSingular}[]> {
    // TODO: implementar
    throw new Error('Method not implemented.');
  }
}`,
    },
    {
      path: `application/use-cases/update-${singular}.use-case.ts`,
      content: `import { Injectable } from '@nestjs/common';
import { ${pascalSingular}Repository } from '../../domain/repositories/${singular}.repositorie';
import { ${pascalSingular} } from '../../domain/entities/${singular}.entitie';

@Injectable()
export class Update${pascalSingular}UseCase {
  constructor(private readonly ${camelSingular}Repository: ${pascalSingular}Repository) {}

  async execute(id: string, data: any): Promise<${pascalSingular}> {
    // TODO: implementar
    throw new Error('Method not implemented.');
  }
}`,
    },
    {
      path: `application/use-cases/delete-${singular}.use-case.ts`,
      content: `import { Injectable } from '@nestjs/common';
import { ${pascalSingular}Repository } from '../../domain/repositories/${singular}.repositorie';

@Injectable()
export class Delete${pascalSingular}UseCase {
  constructor(private readonly ${camelSingular}Repository: ${pascalSingular}Repository) {}

  async execute(id: string): Promise<void> {
    // TODO: implementar
    throw new Error('Method not implemented.');
  }
}`,
    },

    // Infra - Database - Prisma - Mapper
    {
      path: `infra/database/prisma/mappers/prisma-${plural}.mapper.ts`,
      content: `import { ${pascalSingular} } from '../../../../domain/entities/${singular}.entitie';

export class Prisma${pascalPlural}Mapper {
  static toDomain(prisma${pascalSingular}: any): ${pascalSingular} {
    // TODO: implementar mapeamento Prisma -> Domínio
    throw new Error('Method not implemented.');
  }

  static toPrisma(${camelSingular}: ${pascalSingular}): any {
    // TODO: implementar mapeamento Domínio -> Prisma
    throw new Error('Method not implemented.');
  }
}`,
    },

    // Infra - Database - Prisma - Repository
    {
      path: `infra/database/prisma/repositories/prisma-${singular}.repositorie.ts`,
      content: `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/providers/database/models/prisma.service';
import { ${pascalSingular}Repository } from '../../../../domain/repositories/${singular}.repositorie';
import { ${pascalSingular} } from '../../../../domain/entities/${singular}.entitie';
import { Prisma${pascalPlural}Mapper } from '../mappers/prisma-${plural}.mapper';

@Injectable()
export class Prisma${pascalPlural}Repository extends ${pascalSingular}Repository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async create(data: any): Promise<${pascalSingular}> {
    const prisma${pascalSingular} = await this.prisma.${camelSingular}.create({ data });
    return Prisma${pascalPlural}Mapper.toDomain(prisma${pascalSingular});
  }

  async findAll(): Promise<${pascalSingular}[]> {
    const prisma${pascalPlural} = await this.prisma.${camelSingular}.findMany();
    return prisma${pascalPlural}.map(Prisma${pascalPlural}Mapper.toDomain);
  }

  async findById(id: string): Promise<${pascalSingular} | null> {
    const prisma${pascalSingular} = await this.prisma.${camelSingular}.findUnique({ where: { id } });
    return prisma${pascalSingular} ? Prisma${pascalPlural}Mapper.toDomain(prisma${pascalSingular}) : null;
  }

  async update(id: string, data: any): Promise<${pascalSingular}> {
    const prisma${pascalSingular} = await this.prisma.${camelSingular}.update({ where: { id }, data });
    return Prisma${pascalPlural}Mapper.toDomain(prisma${pascalSingular});
  }

  async delete(id: string): Promise<void> {
    await this.prisma.${camelSingular}.delete({ where: { id } });
  }
}`,
    },

    // Infra - HTTP - Controller
    {
      path: `infra/http/controllers/${plural}.controller.ts`,
      content: `import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { Create${pascalSingular}Dto } from '../dto/create-${singular}.dto';
import { Update${pascalSingular}Dto } from '../dto/update-${singular}.dto';
import { Find${pascalSingular}Dto } from '../dto/find-${singular}.dto';
import { ${pascalSingular}ViewModel } from '../view-models/${singular}.view-model';
import { Create${pascalSingular}UseCase } from '../../../application/use-cases/create-${singular}.use-case';
import { Find${pascalPlural}UseCase } from '../../../application/use-cases/find-${plural}.use-case';
import { Update${pascalSingular}UseCase } from '../../../application/use-cases/update-${singular}.use-case';
import { Delete${pascalSingular}UseCase } from '../../../application/use-cases/delete-${singular}.use-case';

@Controller('${kebabPlural}')
export class ${pascalPlural}Controller {
  constructor(
    private readonly create${pascalSingular}UseCase: Create${pascalSingular}UseCase,
    private readonly find${pascalPlural}UseCase: Find${pascalPlural}UseCase,
    private readonly update${pascalSingular}UseCase: Update${pascalSingular}UseCase,
    private readonly delete${pascalSingular}UseCase: Delete${pascalSingular}UseCase,
  ) {}

  @Post()
  async create(@Body() body: Create${pascalSingular}Dto) {
    // TODO: implementar
  }

  @Get()
  async find(@Body() body: Find${pascalSingular}Dto) {
    // TODO: implementar
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Update${pascalSingular}Dto) {
    // TODO: implementar
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    // TODO: implementar
  }
}`,
    },

    // DTOs
    {
      path: `infra/http/dto/create-${singular}.dto.ts`,
      content: `export class Create${pascalSingular}Dto {
  // TODO: definir propriedades
}`,
    },
    {
      path: `infra/http/dto/find-${singular}.dto.ts`,
      content: `export class Find${pascalSingular}Dto {
  // TODO: definir propriedades
}`,
    },
    {
      path: `infra/http/dto/update-${singular}.dto.ts`,
      content: `export class Update${pascalSingular}Dto {
  // TODO: definir propriedades
}`,
    },

    // ViewModel
    {
      path: `infra/http/view-models/${singular}.view-model.ts`,
      content: `import { ${pascalSingular} } from '../../../domain/entities/${singular}.entitie';

export class ${pascalSingular}ViewModel {
  static toHTTP(${camelSingular}: ${pascalSingular}) {
    // TODO: implementar
    return {};
  }
}`,
    },
  ];

  return files;
}

// ------------------------------------------------------------
// 4. Função principal
// ------------------------------------------------------------
async function main() {
  console.log('🚀 Gerador de Módulo - NestJS DDD\n');

  const singular = await ask('Nome do módulo (singular, ex: product): ');
  if (!singular) {
    console.error('❌ Nome inválido.');
    process.exit(1);
  }

  const plural = singular + 's';
  const basePath = path.join(process.cwd(), 'src', 'modules', plural);

  console.log(`\n📁 Criando módulo "${plural}" em ${basePath}\n`);

  const templates = getTemplates(singular);

  for (const file of templates) {
    const filePath = path.join(basePath, file.path);
    await writeFileIfNotExists(filePath, file.content);
  }

  console.log('\n✅ Módulo gerado com sucesso!');
  console.log(`   Não esqueça de importar o ${plural}.module.ts no app.module.ts.`);
}

main().catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});