declare module 'better-sqlite3' {
  interface Database {
    prepare(sql: string): any;
    exec(sql: string): void;
    pragma(pragmaString: string): any;
    close(): void;
  }
  
  interface DatabaseConstructor {
    new (filename: string, options?: any): Database;
  }
  
  const Database: DatabaseConstructor;
  export = Database;
}
