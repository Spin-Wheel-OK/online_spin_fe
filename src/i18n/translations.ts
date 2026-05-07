export type Lang = 'th' | 'en' | 'zh' | 'id';

export const langLabels: Record<Lang, string> = {
  th: 'TH',
  en: 'EN',
  zh: 'ZH',
  id: 'ID',
};

export const langFlags: Record<Lang, string> = {
  th: '\uD83C\uDDF9\uD83C\uDDED',
  en: '\uD83C\uDDEC\uD83C\uDDE7',
  zh: '\uD83C\uDDE8\uD83C\uDDF3',
  id: '\uD83C\uDDEE\uD83C\uDDE9',
};

// ─── Translation dictionary ────────────────────────────────────
// ภาษาธรรมดา เข้าใจง่าย สำหรับคนทั่วไป

const translations = {
  // ─── Common ──────────────────────────────
  connected: { th: 'เชื่อมต่อแล้ว', en: 'Connected', zh: '已连接', id: 'Terhubung' },
  disconnected: { th: 'หลุดการเชื่อมต่อ', en: 'Disconnected', zh: '连接断开', id: 'Terputus' },
  round: { th: 'รางวัลที่', en: 'Prize #', zh: '奖项', id: 'Hadiah #' },
  prize: { th: 'เงินรางวัล', en: 'Amount', zh: '奖金', id: 'Hadiah' },
  amount: { th: 'มูลค่า', en: 'Amount', zh: '金额', id: 'Jumlah' },
  name: { th: 'ชื่อ', en: 'Name', zh: '姓名', id: 'Nama' },
  participant: { th: 'ผู้ร่วมลุ้น', en: 'Participant', zh: '参与者', id: 'Peserta' },
  save: { th: 'บันทึก', en: 'Save', zh: '保存', id: 'Simpan' },
  cancel: { th: 'ยกเลิก', en: 'Cancel', zh: '取消', id: 'Batal' },
  create: { th: 'สร้าง', en: 'Create', zh: '创建', id: 'Buat' },
  edit: { th: 'แก้ไข', en: 'Edit', zh: '编辑', id: 'Edit' },
  delete: { th: 'ลบ', en: 'Del', zh: '删', id: 'Hapus' },
  upload: { th: 'อัปโหลด', en: 'Upload', zh: '上传', id: 'Unggah' },
  reset: { th: 'ล้างข้อมูล', en: 'Reset', zh: '重置', id: 'Reset' },
  select: { th: 'เลือก', en: 'Select', zh: '选择', id: 'Pilih' },
  selected: { th: 'เลือกแล้ว', en: 'Selected', zh: '已选', id: 'Terpilih' },
  continue: { th: 'ต่อไป', en: 'Continue', zh: '继续', id: 'Lanjut' },

  // ─── Viewer (App.tsx) ──────────────────────
  blessingMessage: {
    th: 'OKVIP ขออวยพรให้พนักงานทุกท่านและครอบครัว เปี่ยมด้วยความสุข สุขภาพแข็งแรง และความสำเร็จในทุกย่างก้าว สุขสันต์วันสงกรานต์',
    en: 'OKVIP wishes all employees and families happiness, good health, and success in life and work. Happy Songkran!',
    zh: 'OKVIP 祝所有员工及家人幸福快乐、身体健康、事业与生活双丰收！泼水节快乐！',
    id: 'OKVIP mendoakan semua karyawan dan keluarga selalu bahagia, sehat, dan sukses dalam hidup dan pekerjaan. Selamat Hari Songkran!',
  },
  defaultTitle: { th: 'Lucky Wheel Reward', en: 'Lucky Wheel Reward', zh: 'Lucky Wheel Reward', id: 'Lucky Wheel Reward' },
  roundLabel: { th: 'รางวัลที่ {n} — {prize}', en: 'Prize {n} — {prize}', zh: '奖项 {n} — {prize}', id: 'Hadiah {n} — {prize}' },
  spinning: { th: 'กำลังหมุน...', en: 'Spinning...', zh: '抽奖中...', id: 'Memutar...' },
  waitingParticipants: { th: 'รอรายชื่อผู้ร่วมลุ้น...', en: 'Waiting for participants...', zh: '等待参与者...', id: 'Menunggu peserta...' },
  waitingAdmin: { th: 'รอแอดมินสั่งหมุน...', en: 'Waiting for admin to spin...', zh: '等待管理员开始...', id: 'Menunggu admin memutar...' },

  // ─── Participants ──────────────────────────
  participants: { th: 'รายชื่อผู้ร่วมลุ้น', en: 'Participants', zh: '参与者', id: 'Peserta' },
  noParticipantsYet: { th: 'ยังไม่มีรายชื่อ', en: 'No participants yet', zh: '暂无参与者', id: 'Belum ada peserta' },
  waitingToJoin: { th: 'รอเพิ่มรายชื่อ...', en: 'Waiting for participants...', zh: '等待参与者加入...', id: 'Menunggu peserta bergabung...' },
  wonRound: { th: 'ได้รางวัลที่ #{n}', en: 'Won Prize #{n}', zh: '赢得奖项 {n}', id: 'Memenangkan Hadiah #{n}' },

  // ─── Winner List ───────────────────────────
  winnerList: { th: 'รายชื่อผู้โชคดี', en: 'Winner List', zh: '获奖名单', id: 'Daftar Pemenang' },
  noWinnersYet: { th: 'ยังไม่มีผู้โชคดี', en: 'No winners yet', zh: '暂无获奖者', id: 'Belum ada pemenang' },
  spinToPickWinner: { th: 'หมุนวงล้อลุ้นรางวัล!', en: 'Spin the wheel to pick a winner!', zh: '旋转轮盘抽奖！', id: 'Putar roda untuk memilih pemenang!' },
  winner: { th: 'ผู้โชคดี', en: 'Winner', zh: '获奖者', id: 'Pemenang' },

  // ─── Winner Modal ──────────────────────────
  weHaveAWinner: { th: 'ยินดีด้วย!', en: 'We Have a Winner!', zh: '恭喜中奖！', id: 'Selamat, Ada Pemenang!' },

  // ─── Admin Panel ───────────────────────────
  adminPanel: { th: 'หน้าจัดการ', en: 'Admin Panel', zh: '管理面板', id: 'Panel Admin' },
  viewWheel: { th: 'ดูวงล้อ', en: 'View Wheel', zh: '查看轮盘', id: 'Lihat Roda' },

  // Session
  selectSession: { th: '— เลือกงาน —', en: '— Select Session —', zh: '— 选择场次 —', id: '— Pilih Sesi —' },
  sessionLabel: { th: 'ครั้งที่ {n} — {name}', en: 'Session {n} — {name}', zh: '第{n}场 — {name}', id: 'Sesi {n} — {name}' },
  newSession: { th: '+ เพิ่ม', en: '+ New', zh: '+ 新增', id: '+ Baru' },
  editSessionTitle: { th: 'แก้ไขครั้งที่ {n}', en: 'Edit Session {n}', zh: '编辑第{n}场', id: 'Edit Sesi {n}' },
  newSessionTitle: { th: 'สร้างงานใหม่', en: 'New Session', zh: '新建场次', id: 'Sesi Baru' },
  sessionNamePlaceholder: { th: 'เช่น งานเลี้ยง 1 มีนาคม', en: 'e.g. Event March 1st', zh: '例如 三月一日活动', id: 'mis. Acara 1 Maret' },
  selectOrCreateSession: { th: 'เลือกงานด้านบน หรือสร้างงานใหม่เพื่อเริ่มใช้งาน', en: 'Select or create a session above to begin.', zh: '请在上方选择或创建场次。', id: 'Pilih atau buat sesi di atas untuk memulai.' },
  deleteSessionConfirm: { th: 'ลบครั้งที่ {n} "{name}" ?\nรายชื่อ, รอบ, ผู้โชคดี ทั้งหมดจะหายไป', en: 'Delete Session {n} "{name}"?\nAll participants, rounds, and winners will be deleted.', zh: '删除第{n}场 "{name}"？\n所有数据将被删除。', id: 'Hapus Sesi {n} "{name}"?\nSemua peserta, ronde, dan pemenang akan dihapus.' },
  resetSessionConfirm: { th: 'ล้างข้อมูลทั้งหมดของครั้งที่ {n} "{name}" ?\nรายชื่อ, รอบ, ผู้โชคดี จะถูกล้าง', en: 'Reset all data for Session {n} "{name}"?\nParticipants, rounds, and winners will be cleared.', zh: '重置第{n}场 "{name}" 的所有数据？', id: 'Reset semua data untuk Sesi {n} "{name}"?\nPeserta, ronde, dan pemenang akan dihapus.' },

  // Participants (admin)
  participantListAdmin: { th: 'รายชื่อผู้ร่วมลุ้น', en: 'Participant List', zh: '参与者列表', id: 'Daftar Peserta' },
  oneNamePerLine: { th: 'พิมพ์ชื่อ 1 คนต่อ 1 บรรทัด (อัปโหลดใหม่จะแทนที่รายชื่อเดิม)', en: 'One name per line. Uploading will replace the current list.', zh: '每行一个名字。上传将替换当前列表。', id: 'Satu nama per baris. Mengunggah akan mengganti daftar saat ini.' },
  participantPlaceholder: { th: 'สมชาย\nสมหญิง\nสมศักดิ์\n...', en: 'Alice\nBob\nCharlie\n...', zh: '张三\n李四\n王五\n...', id: 'Andi\nBudi\nCitra\n...' },
  currentlyActive: { th: 'มีรายชื่ออยู่: {n} คน', en: 'Currently active: {n} participants', zh: '当前: {n} 位参与者', id: 'Aktif saat ini: {n} peserta' },
  selectSessionFirst: { th: 'เลือกงานก่อนนะ', en: 'Select a session first.', zh: '请先选择场次。', id: 'Pilih sesi terlebih dahulu.' },
  enterAtLeastOne: { th: 'ใส่ชื่ออย่างน้อย 1 คน', en: 'Enter at least one name.', zh: '请至少输入一个名字。', id: 'Masukkan minimal satu nama.' },

  // Round Control
  roundControl: { th: 'จัดการรางวัล', en: 'Prize Control', zh: '奖项管理', id: 'Kelola Hadiah' },
  addRound: { th: '+ เพิ่มรางวัล', en: '+ Add Prize', zh: '+ 添加奖项', id: '+ Tambah Hadiah' },
  newRound: { th: 'เพิ่มรางวัลใหม่', en: 'New Prize', zh: '新奖项', id: 'Hadiah Baru' },
  editRoundTitle: { th: 'แก้ไขรางวัล #{n}', en: 'Edit Prize #{n}', zh: '编辑奖项 {n}', id: 'Edit Hadiah #{n}' },
  prizeLabel: { th: 'ชื่อรางวัล', en: 'Prize Label', zh: '奖品名称', id: 'Nama Hadiah' },
  prizeLabelPlaceholder: { th: 'เช่น 50,000 THB', en: 'e.g. 50,000 THB', zh: '例如 50,000 THB', id: 'mis. 50.000 THB' },
  amountTHB: { th: 'มูลค่า (THB)', en: 'Amount (THB)', zh: '金额 (THB)', id: 'Jumlah (THB)' },
  totalSpins: { th: 'จำนวนครั้งที่หมุน', en: 'Total Spins', zh: '抽奖次数', id: 'Total Putaran' },
  spinsLeft: { th: 'เหลือ', en: 'Spins left', zh: '剩余', id: 'Sisa putaran' },
  deleteRoundConfirm: { th: 'ลบรางวัล #{n} ?', en: 'Delete Prize #{n}?', zh: '删除奖项 {n}？', id: 'Hapus Hadiah #{n}?' },
  selectedRound: { th: 'รางวัลที่เลือก:', en: 'Selected Prize:', zh: '当前奖项:', id: 'Hadiah Terpilih:' },
  roundInfo: { th: 'รางวัลที่ {n} — {prize}', en: 'Prize {n} — {prize}', zh: '奖项 {n} — {prize}', id: 'Hadiah {n} — {prize}' },
  remainingSpins: { th: 'หมุนได้อีก: {n} ครั้ง', en: 'Remaining spins: {n}', zh: '剩余次数: {n}', id: 'Sisa putaran: {n}' },
  spinRound: { th: 'หมุนรางวัล {n}', en: 'Spin Prize {n}', zh: '抽奖项 {n}', id: 'Putar Hadiah {n}' },
  noParticipants: { th: 'ยังไม่มีรายชื่อ', en: 'No Participants', zh: '无参与者', id: 'Tidak Ada Peserta' },
  noSpinsLeft: { th: 'หมุนครบแล้ว', en: 'No Spins Left', zh: '已抽完', id: 'Putaran Habis' },
  fillAllFields: { th: 'กรอกข้อมูลให้ครบด้วย', en: 'Please fill all fields correctly.', zh: '请填写完整信息。', id: 'Mohon isi semua kolom dengan benar.' },

  // Winners Log (admin)
  winnersLog: { th: 'รายชื่อผู้โชคดี', en: 'Winners Log', zh: '获奖记录', id: 'Catatan Pemenang' },
  exportexcel: { th: 'ส่งออกเป็น Excel', en: 'Export to Excel', zh: '导出为 Excel', id: 'Ekspor ke Excel' },
  noWinnersYetAdmin: { th: 'ยังไม่มีผู้โชคดี', en: 'No winners yet.', zh: '暂无获奖者。', id: 'Belum ada pemenang.' },
  time: { th: 'เวลา', en: 'Time', zh: '时间', id: 'Waktu' },
  actions: { th: 'จัดการ', en: 'Actions', zh: '操作', id: 'Aksi' },

  // Status messages
  msgSessionCreated: { th: 'สร้างงาน "{name}" เรียบร้อย', en: 'Session "{name}" created.', zh: '场次 "{name}" 已创建。', id: 'Sesi "{name}" telah dibuat.' },
  msgSessionUpdated: { th: 'แก้ไขงานเรียบร้อย', en: 'Session updated.', zh: '场次已更新。', id: 'Sesi diperbarui.' },
  msgSessionDeleted: { th: 'ลบงาน "{name}" เรียบร้อย', en: 'Session "{name}" deleted.', zh: '场次 "{name}" 已删除。', id: 'Sesi "{name}" dihapus.' },
  msgResetSuccess: { th: 'ล้างข้อมูลเรียบร้อย', en: 'Data reset successfully.', zh: '数据已重置。', id: 'Data berhasil direset.' },
  msgUploaded: { th: 'อัปโหลด {n} คนเรียบร้อย', en: 'Uploaded {n} participants.', zh: '已上传 {n} 位参与者。', id: '{n} peserta berhasil diunggah.' },
  msgRoundCreated: { th: 'เพิ่มรางวัลเรียบร้อย', en: 'Prize created.', zh: '奖项已创建。', id: 'Hadiah berhasil dibuat.' },
  msgRoundUpdated: { th: 'แก้ไขรางวัล #{n} เรียบร้อย', en: 'Prize #{n} updated.', zh: '奖项 {n} 已更新。', id: 'Hadiah #{n} diperbarui.' },
  msgRoundDeleted: { th: 'ลบรางวัล #{n} เรียบร้อย', en: 'Prize #{n} deleted.', zh: '奖项 {n} 已删除。', id: 'Hadiah #{n} dihapus.' },
  msgSpinning: { th: 'กำลังหมุนรางวัล {n}...', en: 'Spinning prize {n}...', zh: '正在抽奖项 {n}...', id: 'Memutar hadiah {n}...' },
  msgWinner: { th: 'ผู้โชคดี: {name} — {prize}', en: 'Winner: {name} — {prize}', zh: '获奖者: {name} — {prize}', id: 'Pemenang: {name} — {prize}' },
  msgEnterSessionName: { th: 'ใส่ชื่องานด้วย', en: 'Enter a session name.', zh: '请输入场次名称。', id: 'Masukkan nama sesi.' },
  msgRoundNotFound: { th: 'ไม่พบรางวัลนี้', en: 'Prize not found.', zh: '未找到该奖项。', id: 'Hadiah tidak ditemukan.' },
  msgNoRemainingSpins: { th: 'หมุนครบแล้ว', en: 'No remaining spins.', zh: '已抽完。', id: 'Tidak ada putaran tersisa.' },
  msgNoParticipants: { th: 'ยังไม่มีรายชื่อ', en: 'No participants.', zh: '无参与者。', id: 'Tidak ada peserta.' },
  msgError: { th: 'เกิดข้อผิดพลาด', en: 'Error', zh: '出错了', id: 'Terjadi kesalahan' },
  msgFailedCreateSession: { th: 'สร้างงานไม่สำเร็จ', en: 'Failed to create session.', zh: '创建失败。', id: 'Gagal membuat sesi.' },
  msgFailedUpdateSession: { th: 'แก้ไขงานไม่สำเร็จ', en: 'Failed to update session.', zh: '更新失败。', id: 'Gagal memperbarui sesi.' },
  msgFailedDeleteSession: { th: 'ลบงานไม่สำเร็จ', en: 'Failed to delete session.', zh: '删除失败。', id: 'Gagal menghapus sesi.' },
  msgFailedReset: { th: 'ล้างข้อมูลไม่สำเร็จ', en: 'Reset failed.', zh: '重置失败。', id: 'Gagal mereset.' },
  msgFailedUpload: { th: 'อัปโหลดไม่สำเร็จ', en: 'Upload failed.', zh: '上传失败。', id: 'Gagal mengunggah.' },
  msgFailedSaveRound: { th: 'บันทึกรางวัลไม่สำเร็จ', en: 'Failed to save prize.', zh: '保存失败。', id: 'Gagal menyimpan hadiah.' },
  msgFailedDeleteRound: { th: 'ลบรางวัลไม่สำเร็จ', en: 'Failed to delete prize.', zh: '删除失败。', id: 'Gagal menghapus hadiah.' },
  msgSpinFailed: { th: 'หมุนไม่สำเร็จ', en: 'Spin failed', zh: '抽奖失败', id: 'Gagal memutar' },
  msgNetworkError: { th: 'เน็ตมีปัญหา', en: 'Network error.', zh: '网络错误。', id: 'Kesalahan jaringan.' },
} as const;

export type TranslationKey = keyof typeof translations;

export default translations;
