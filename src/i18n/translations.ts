export type Lang = 'th' | 'en' | 'zh';

export const langLabels: Record<Lang, string> = {
  th: 'TH',
  en: 'EN',
  zh: 'ZH',
};

export const langFlags: Record<Lang, string> = {
  th: '\uD83C\uDDF9\uD83C\uDDED',
  en: '\uD83C\uDDEC\uD83C\uDDE7',
  zh: '\uD83C\uDDE8\uD83C\uDDF3',
};

// ─── Translation dictionary ────────────────────────────────────
// ภาษาธรรมดา เข้าใจง่าย สำหรับคนทั่วไป

const translations = {
  // ─── Common ──────────────────────────────
  connected: { th: 'เชื่อมต่อแล้ว', en: 'Connected', zh: '已连接' },
  disconnected: { th: 'หลุดการเชื่อมต่อ', en: 'Disconnected', zh: '连接断开' },
  round: { th: 'รอบ', en: 'Round', zh: '轮' },
  prize: { th: 'รางวัล', en: 'Prize', zh: '奖品' },
  amount: { th: 'มูลค่า', en: 'Amount', zh: '金额' },
  name: { th: 'ชื่อ', en: 'Name', zh: '姓名' },
  participant: { th: 'ผู้ร่วมลุ้น', en: 'Participant', zh: '参与者' },
  save: { th: 'บันทึก', en: 'Save', zh: '保存' },
  cancel: { th: 'ยกเลิก', en: 'Cancel', zh: '取消' },
  create: { th: 'สร้าง', en: 'Create', zh: '创建' },
  edit: { th: 'แก้ไข', en: 'Edit', zh: '编辑' },
  delete: { th: 'ลบ', en: 'Del', zh: '删' },
  upload: { th: 'อัปโหลด', en: 'Upload', zh: '上传' },
  reset: { th: 'ล้างข้อมูล', en: 'Reset', zh: '重置' },
  select: { th: 'เลือก', en: 'Select', zh: '选择' },
  selected: { th: 'เลือกแล้ว', en: 'Selected', zh: '已选' },
  continue: { th: 'ต่อไป', en: 'Continue', zh: '继续' },

  // ─── Viewer (App.tsx) ──────────────────────
  defaultTitle: { th: 'Lucky Wheel Reward', en: 'Lucky Wheel Reward', zh: 'Lucky Wheel Reward' },
  roundLabel: { th: 'รอบที่ {n} — {prize}', en: 'Round {n} — {prize}', zh: '第{n}轮 — {prize}' },
  spinning: { th: 'กำลังหมุน...', en: 'Spinning...', zh: '抽奖中...' },
  waitingParticipants: { th: 'รอรายชื่อผู้ร่วมลุ้น...', en: 'Waiting for participants...', zh: '等待参与者...' },
  waitingAdmin: { th: 'รอแอดมินสั่งหมุน...', en: 'Waiting for admin to spin...', zh: '等待管理员开始...' },

  // ─── Participants ──────────────────────────
  participants: { th: 'รายชื่อผู้ร่วมลุ้น', en: 'Participants', zh: '参与者' },
  noParticipantsYet: { th: 'ยังไม่มีรายชื่อ', en: 'No participants yet', zh: '暂无参与者' },
  waitingToJoin: { th: 'รอเพิ่มรายชื่อ...', en: 'Waiting for participants...', zh: '等待参与者加入...' },
  wonRound: { th: 'ได้รางวัลรอบ #{n}', en: 'Won Round #{n}', zh: '赢得第{n}轮' },

  // ─── Winner List ───────────────────────────
  winnerList: { th: 'รายชื่อผู้โชคดี', en: 'Winner List', zh: '获奖名单' },
  noWinnersYet: { th: 'ยังไม่มีผู้โชคดี', en: 'No winners yet', zh: '暂无获奖者' },
  spinToPickWinner: { th: 'หมุนวงล้อลุ้นรางวัล!', en: 'Spin the wheel to pick a winner!', zh: '旋转轮盘抽奖！' },
  winner: { th: 'ผู้โชคดี', en: 'Winner', zh: '获奖者' },

  // ─── Winner Modal ──────────────────────────
  weHaveAWinner: { th: 'ยินดีด้วย!', en: 'We Have a Winner!', zh: '恭喜中奖！' },

  // ─── Admin Panel ───────────────────────────
  adminPanel: { th: 'หน้าจัดการ', en: 'Admin Panel', zh: '管理面板' },
  viewWheel: { th: 'ดูวงล้อ', en: 'View Wheel', zh: '查看轮盘' },

  // Session
  selectSession: { th: '— เลือกงาน —', en: '— Select Session —', zh: '— 选择场次 —' },
  sessionLabel: { th: 'ครั้งที่ {n} — {name}', en: 'Session {n} — {name}', zh: '第{n}场 — {name}' },
  newSession: { th: '+ เพิ่มงาน', en: '+ Session', zh: '+ 场次' },
  editSessionTitle: { th: 'แก้ไขครั้งที่ {n}', en: 'Edit Session {n}', zh: '编辑第{n}场' },
  newSessionTitle: { th: 'สร้างงานใหม่', en: 'New Session', zh: '新建场次' },
  sessionNamePlaceholder: { th: 'เช่น งานเลี้ยง 1 มีนาคม', en: 'e.g. Event March 1st', zh: '例如 三月一日活动' },
  selectOrCreateSession: { th: 'เลือกงานด้านบน หรือสร้างงานใหม่เพื่อเริ่มใช้งาน', en: 'Select or create a session above to begin.', zh: '请在上方选择或创建场次。' },
  deleteSessionConfirm: { th: 'ลบครั้งที่ {n} "{name}" ?\nรายชื่อ, รอบ, ผู้โชคดี ทั้งหมดจะหายไป', en: 'Delete Session {n} "{name}"?\nAll participants, rounds, and winners will be deleted.', zh: '删除第{n}场 "{name}"？\n所有数据将被删除。' },
  resetSessionConfirm: { th: 'ล้างข้อมูลทั้งหมดของครั้งที่ {n} "{name}" ?\nรายชื่อ, รอบ, ผู้โชคดี จะถูกล้าง', en: 'Reset all data for Session {n} "{name}"?\nParticipants, rounds, and winners will be cleared.', zh: '重置第{n}场 "{name}" 的所有数据？' },

  // Participants (admin)
  participantListAdmin: { th: 'รายชื่อผู้ร่วมลุ้น', en: 'Participant List', zh: '参与者列表' },
  oneNamePerLine: { th: 'พิมพ์ชื่อ 1 คนต่อ 1 บรรทัด (อัปโหลดใหม่จะแทนที่รายชื่อเดิม)', en: 'One name per line. Uploading will replace the current list.', zh: '每行一个名字。上传将替换当前列表。' },
  participantPlaceholder: { th: 'สมชาย\nสมหญิง\nสมศักดิ์\n...', en: 'Alice\nBob\nCharlie\n...', zh: '张三\n李四\n王五\n...' },
  currentlyActive: { th: 'มีรายชื่ออยู่: {n} คน', en: 'Currently active: {n} participants', zh: '当前: {n} 位参与者' },
  selectSessionFirst: { th: 'เลือกงานก่อนนะ', en: 'Select a session first.', zh: '请先选择场次。' },
  enterAtLeastOne: { th: 'ใส่ชื่ออย่างน้อย 1 คน', en: 'Enter at least one name.', zh: '请至少输入一个名字。' },

  // Round Control
  roundControl: { th: 'จัดการรอบ', en: 'Round Control', zh: '轮次管理' },
  addRound: { th: '+ เพิ่มรอบ', en: '+ Add Round', zh: '+ 添加轮' },
  newRound: { th: 'เพิ่มรอบใหม่', en: 'New Round', zh: '新轮次' },
  editRoundTitle: { th: 'แก้ไขรอบ #{n}', en: 'Edit Round #{n}', zh: '编辑第{n}轮' },
  prizeLabel: { th: 'ชื่อรางวัล', en: 'Prize Label', zh: '奖品名称' },
  prizeLabelPlaceholder: { th: 'เช่น 50,000 THB', en: 'e.g. 50,000 THB', zh: '例如 50,000 THB' },
  amountTHB: { th: 'มูลค่า (THB)', en: 'Amount (THB)', zh: '金额 (THB)' },
  totalSpins: { th: 'จำนวนครั้งที่หมุน', en: 'Total Spins', zh: '抽奖次数' },
  spinsLeft: { th: 'เหลือ', en: 'Spins left', zh: '剩余' },
  deleteRoundConfirm: { th: 'ลบรอบ #{n} ?', en: 'Delete Round #{n}?', zh: '删除第{n}轮？' },
  selectedRound: { th: 'รอบที่เลือก:', en: 'Selected Round:', zh: '当前选择:' },
  roundInfo: { th: 'รอบ {n} — {prize}', en: 'Round {n} — {prize}', zh: '第{n}轮 — {prize}' },
  remainingSpins: { th: 'หมุนได้อีก: {n} ครั้ง', en: 'Remaining spins: {n}', zh: '剩余次数: {n}' },
  spinRound: { th: 'หมุนรอบ {n}', en: 'Spin Round {n}', zh: '开始抽第{n}轮' },
  noParticipants: { th: 'ยังไม่มีรายชื่อ', en: 'No Participants', zh: '无参与者' },
  noSpinsLeft: { th: 'หมุนครบแล้ว', en: 'No Spins Left', zh: '已抽完' },
  fillAllFields: { th: 'กรอกข้อมูลให้ครบด้วย', en: 'Please fill all fields correctly.', zh: '请填写完整信息。' },

  // Winners Log (admin)
  winnersLog: { th: 'รายชื่อผู้โชคดี', en: 'Winners Log', zh: '获奖记录' },
  noWinnersYetAdmin: { th: 'ยังไม่มีผู้โชคดี', en: 'No winners yet.', zh: '暂无获奖者。' },
  time: { th: 'เวลา', en: 'Time', zh: '时间' },
  actions: { th: 'จัดการ', en: 'Actions', zh: '操作' },

  // Status messages
  msgSessionCreated: { th: 'สร้างงาน "{name}" เรียบร้อย', en: 'Session "{name}" created.', zh: '场次 "{name}" 已创建。' },
  msgSessionUpdated: { th: 'แก้ไขงานเรียบร้อย', en: 'Session updated.', zh: '场次已更新。' },
  msgSessionDeleted: { th: 'ลบงาน "{name}" เรียบร้อย', en: 'Session "{name}" deleted.', zh: '场次 "{name}" 已删除。' },
  msgResetSuccess: { th: 'ล้างข้อมูลเรียบร้อย', en: 'Data reset successfully.', zh: '数据已重置。' },
  msgUploaded: { th: 'อัปโหลด {n} คนเรียบร้อย', en: 'Uploaded {n} participants.', zh: '已上传 {n} 位参与者。' },
  msgRoundCreated: { th: 'เพิ่มรอบเรียบร้อย', en: 'Round created.', zh: '轮次已创建。' },
  msgRoundUpdated: { th: 'แก้ไขรอบ #{n} เรียบร้อย', en: 'Round #{n} updated.', zh: '第{n}轮已更新。' },
  msgRoundDeleted: { th: 'ลบรอบ #{n} เรียบร้อย', en: 'Round #{n} deleted.', zh: '第{n}轮已删除。' },
  msgSpinning: { th: 'กำลังหมุนรอบ {n}...', en: 'Spinning round {n}...', zh: '正在抽第{n}轮...' },
  msgWinner: { th: 'ผู้โชคดี: {name} — {prize}', en: 'Winner: {name} — {prize}', zh: '获奖者: {name} — {prize}' },
  msgEnterSessionName: { th: 'ใส่ชื่องานด้วย', en: 'Enter a session name.', zh: '请输入场次名称。' },
  msgRoundNotFound: { th: 'ไม่พบรอบนี้', en: 'Round not found.', zh: '未找到该轮。' },
  msgNoRemainingSpins: { th: 'หมุนครบแล้ว', en: 'No remaining spins.', zh: '已抽完。' },
  msgNoParticipants: { th: 'ยังไม่มีรายชื่อ', en: 'No participants.', zh: '无参与者。' },
  msgError: { th: 'เกิดข้อผิดพลาด', en: 'Error', zh: '出错了' },
  msgFailedCreateSession: { th: 'สร้างงานไม่สำเร็จ', en: 'Failed to create session.', zh: '创建失败。' },
  msgFailedUpdateSession: { th: 'แก้ไขงานไม่สำเร็จ', en: 'Failed to update session.', zh: '更新失败。' },
  msgFailedDeleteSession: { th: 'ลบงานไม่สำเร็จ', en: 'Failed to delete session.', zh: '删除失败。' },
  msgFailedReset: { th: 'ล้างข้อมูลไม่สำเร็จ', en: 'Reset failed.', zh: '重置失败。' },
  msgFailedUpload: { th: 'อัปโหลดไม่สำเร็จ', en: 'Upload failed.', zh: '上传失败。' },
  msgFailedSaveRound: { th: 'บันทึกรอบไม่สำเร็จ', en: 'Failed to save round.', zh: '保存失败。' },
  msgFailedDeleteRound: { th: 'ลบรอบไม่สำเร็จ', en: 'Failed to delete round.', zh: '删除失败。' },
  msgSpinFailed: { th: 'หมุนไม่สำเร็จ', en: 'Spin failed', zh: '抽奖失败' },
  msgNetworkError: { th: 'เน็ตมีปัญหา', en: 'Network error.', zh: '网络错误。' },
} as const;

export type TranslationKey = keyof typeof translations;

export default translations;
