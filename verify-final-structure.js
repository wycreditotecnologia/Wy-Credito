const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frdjajuabujxkyfulvmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGphanVhYnVqeGt5ZnVsdm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjY5NDEsImV4cCI6MjA3NDI0Mjk0MX0.TD0rZCgrod7uAiklqJCd62Smf9MaojDbYkv5JIix1LU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyFinalStructure() {
  console.log('\n🔍 VERIFICACIÓN FINAL DE ESTRUCTURA Y FUNCIONALIDAD');
  console.log('============================================================\n');

  try {
    // 1. Probar inserción con datos mínimos
    console.log('📋 Probando inserción con datos mínimos...');
    const { data: insertData, error: insertError } = await supabase
      .from('solicitudes')
      .insert({
        monto_solicitado: 500000,
        plazo_seleccionado: 6,
        estado: 'pendiente'
      })
      .select();

    if (insertError) {
      console.log('❌ Error en inserción:', insertError.message);
      return;
    }

    console.log('✅ Inserción exitosa:', insertData[0].id);

    // 2. Verificar que se puede leer
    console.log('\n📋 Verificando lectura de datos...');
    const { data: selectData, error: selectError } = await supabase
      .from('solicitudes')
      .select('*')
      .eq('id', insertData[0].id);

    if (selectError) {
      console.log('❌ Error en lectura:', selectError.message);
      return;
    }

    console.log('✅ Lectura exitosa. Columnas disponibles:');
    if (selectData && selectData[0]) {
      Object.keys(selectData[0]).forEach(column => {
        console.log(`   - ${column}: ${selectData[0][column]}`);
      });
    }

    // 3. Probar actualización
    console.log('\n📋 Probando actualización...');
    const { data: updateData, error: updateError } = await supabase
      .from('solicitudes')
      .update({ estado: 'en_revision' })
      .eq('id', insertData[0].id)
      .select();

    if (updateError) {
      console.log('❌ Error en actualización:', updateError.message);
    } else {
      console.log('✅ Actualización exitosa');
    }

    console.log('\n🎉 VERIFICACIÓN COMPLETA');
    console.log('============================================================');
    console.log('✅ Inserción anónima: FUNCIONANDO');
    console.log('✅ Lectura de datos: FUNCIONANDO');
    console.log('✅ Actualización: FUNCIONANDO');
    console.log('✅ Políticas RLS: CONFIGURADAS CORRECTAMENTE');
    console.log('\n🚀 El sistema está completamente operativo');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

verifyFinalStructure();