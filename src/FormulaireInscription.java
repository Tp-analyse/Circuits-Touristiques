import java.awt.Color;
import java.awt.EventQueue;
import java.awt.Font;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import javax.swing.border.EmptyBorder;

public class FormulaireInscription extends JFrame {

	private JPanel contentPane;
	private JTextField txtNom;
	private JTextField txtPrenom;
	private JTextField txtCourriel;
	private JTextField txtTelephone;
	private JPasswordField txtMotDePasse;
	private JPasswordField txtConfirmation;

	public static void main(String[] args) {
		EventQueue.invokeLater(new Runnable() {
			public void run() {
				try {
					FormulaireInscription frame = new FormulaireInscription();
					frame.setVisible(true);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		});
	}

	public FormulaireInscription() {
		setTitle("Formulaire d'inscription");
		setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		setBounds(100, 100, 520, 390);
		contentPane = new JPanel();
		contentPane.setBorder(new EmptyBorder(5, 5, 5, 5));
		setContentPane(contentPane);
		contentPane.setLayout(null);

		JLabel lblTitre = new JLabel("Inscription du client");
		lblTitre.setFont(new Font("Tahoma", Font.BOLD, 16));
		lblTitre.setBounds(158, 18, 192, 20);
		contentPane.add(lblTitre);

		JLabel lblNom = new JLabel("Nom");
		lblNom.setBounds(51, 68, 110, 14);
		contentPane.add(lblNom);

		txtNom = new JTextField();
		txtNom.setBounds(204, 65, 213, 20);
		contentPane.add(txtNom);
		txtNom.setColumns(10);

		JLabel lblPrenom = new JLabel("Prénom");
		lblPrenom.setBounds(51, 101, 110, 14);
		contentPane.add(lblPrenom);

		txtPrenom = new JTextField();
		txtPrenom.setColumns(10);
		txtPrenom.setBounds(204, 98, 213, 20);
		contentPane.add(txtPrenom);

		JLabel lblCourriel = new JLabel("Courriel");
		lblCourriel.setBounds(51, 134, 110, 14);
		contentPane.add(lblCourriel);

		txtCourriel = new JTextField();
		txtCourriel.setColumns(10);
		txtCourriel.setBounds(204, 131, 213, 20);
		contentPane.add(txtCourriel);

		JLabel lblTelephone = new JLabel("Téléphone");
		lblTelephone.setBounds(51, 167, 110, 14);
		contentPane.add(lblTelephone);

		txtTelephone = new JTextField();
		txtTelephone.setColumns(10);
		txtTelephone.setBounds(204, 164, 213, 20);
		contentPane.add(txtTelephone);

		JLabel lblMotDePasse = new JLabel("Mot de passe");
		lblMotDePasse.setBounds(51, 200, 110, 14);
		contentPane.add(lblMotDePasse);

		txtMotDePasse = new JPasswordField();
		txtMotDePasse.setBounds(204, 197, 213, 20);
		contentPane.add(txtMotDePasse);

		JLabel lblConfirmation = new JLabel("Confirmation MDP");
		lblConfirmation.setBounds(51, 233, 110, 14);
		contentPane.add(lblConfirmation);

		txtConfirmation = new JPasswordField();
		txtConfirmation.setBounds(204, 230, 213, 20);
		contentPane.add(txtConfirmation);

		JLabel lblMessage = new JLabel("Veuillez remplir le formulaire.");
		lblMessage.setForeground(new Color(0, 102, 153));
		lblMessage.setFont(new Font("Tahoma", Font.BOLD, 11));
		lblMessage.setBounds(51, 308, 366, 14);
		contentPane.add(lblMessage);

		JButton btnEffacer = new JButton("Effacer");
		btnEffacer.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				txtNom.setText("");
				txtPrenom.setText("");
				txtCourriel.setText("");
				txtTelephone.setText("");
				txtMotDePasse.setText("");
				txtConfirmation.setText("");
				lblMessage.setForeground(new Color(0, 102, 153));
				lblMessage.setText("Le formulaire a été réinitialisé.");
			}
		});
		btnEffacer.setBounds(132, 271, 108, 23);
		contentPane.add(btnEffacer);

		JButton btnInscrire = new JButton("S'inscrire");
		btnInscrire.setFont(new Font("Tahoma", Font.BOLD, 11));
		btnInscrire.setForeground(new Color(0, 128, 0));
		btnInscrire.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				String nom = txtNom.getText().trim();
				String prenom = txtPrenom.getText().trim();
				String courriel = txtCourriel.getText().trim();
				String telephone = txtTelephone.getText().trim();
				String motDePasse = new String(txtMotDePasse.getPassword());
				String confirmation = new String(txtConfirmation.getPassword());

				if (nom.isEmpty() || prenom.isEmpty() || courriel.isEmpty() || telephone.isEmpty()
						|| motDePasse.isEmpty() || confirmation.isEmpty()) {
					lblMessage.setForeground(Color.RED);
					lblMessage.setText("Tous les champs sont obligatoires.");
					return;
				}

				if (!courriel.contains("@") || !courriel.contains(".")) {
					lblMessage.setForeground(Color.RED);
					lblMessage.setText("Le courriel saisi n'est pas valide.");
					return;
				}

				if (!motDePasse.equals(confirmation)) {
					lblMessage.setForeground(Color.RED);
					lblMessage.setText("Les mots de passe ne correspondent pas.");
					return;
				}

				lblMessage.setForeground(new Color(0, 128, 0));
				lblMessage.setText("Inscription enregistrée avec succès.");
			}
		});
		btnInscrire.setBounds(266, 271, 108, 23);
		contentPane.add(btnInscrire);
	}
}